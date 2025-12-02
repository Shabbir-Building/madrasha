import { type Request, type Response } from "express";

import { HttpStatus } from "../config/constants";
import { Donation } from "../models/donation/donation.model";
import { Expense } from "../models/expense/expense.model";
import { Income } from "../models/income/income.model";
import { type ApiResponse } from "../types/common";

type OverviewStats = {
  totalIncome: number;
  totalDonations: number;
  totalExpense: number;
  currentBalance: number;
};

type MonthlyIncomeExpense = {
  month: string;
  income: number;
  expense: number;
};

type MonthlyDonations = {
  month: string;
  sadaqah: number;
  zakat: number;
  membership: number;
  others: number;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper function to get date range for current year
const getYearDateRanges = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Current year: from Jan 1 to today
  const currentYearStart = new Date(currentYear, 0, 1);
  const currentYearEnd = now;

  return {
    currentYearStart,
    currentYearEnd,
  };
};

const parseBranchQuery = (value: unknown): number | undefined => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "string" && value.toLowerCase() === "all") {
    return undefined;
  }

  const parsed =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : Number.parseInt(String(value), 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

export const getOverviewStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentYearStart, currentYearEnd } = getYearDateRanges();
  const branchParam = parseBranchQuery(req.query.branch);
  const branchFilter =
    branchParam != null ? { branch: branchParam } : undefined;
  // Get current year totals
  const [currentIncome, currentDonations, currentExpense] = await Promise.all([
    Income.aggregate([
      {
        $match: {
          income_date: { $gte: currentYearStart, $lte: currentYearEnd },
          ...(branchFilter ?? {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Donation.aggregate([
      {
        $match: {
          donation_date: { $gte: currentYearStart, $lte: currentYearEnd },
          ...(branchFilter ?? {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$donation_amount" } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          expense_date: { $gte: currentYearStart, $lte: currentYearEnd },
          ...(branchFilter ?? {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = currentIncome[0]?.total || 0;
  const totalDonations = currentDonations[0]?.total || 0;
  const totalExpense = currentExpense[0]?.total || 0;
  const currentBalance = totalIncome + totalDonations - totalExpense;

  const stats: OverviewStats = {
    totalIncome,
    totalDonations,
    totalExpense,
    currentBalance,
  };

  const response: ApiResponse<OverviewStats> = {
    success: true,
    message: "Overview statistics retrieved successfully",
    data: stats,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const getIncomeExpenseComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
  const branchParam = parseBranchQuery(req.query.branch);
  const branchFilter =
    branchParam != null ? { branch: branchParam } : undefined;

  // Aggregate income by month
  const incomeByMonth = await Income.aggregate([
    {
      $match: {
        income_date: { $gte: yearStart, $lte: yearEnd },
        ...(branchFilter ?? {}),
      },
    },
    {
      $group: {
        _id: { $month: "$income_date" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Aggregate expense by month
  const expenseByMonth = await Expense.aggregate([
    {
      $match: {
        expense_date: { $gte: yearStart, $lte: yearEnd },
        ...(branchFilter ?? {}),
      },
    },
    {
      $group: {
        _id: { $month: "$expense_date" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Create lookup maps
  const incomeMap = new Map(
    incomeByMonth.map((item) => [item._id, item.total])
  );
  const expenseMap = new Map(
    expenseByMonth.map((item) => [item._id, item.total])
  );

  // Build array with all 12 months
  const comparison: MonthlyIncomeExpense[] = MONTH_NAMES.map(
    (month, index) => ({
      month,
      income: incomeMap.get(index + 1) || 0,
      expense: expenseMap.get(index + 1) || 0,
    })
  );

  const response: ApiResponse<MonthlyIncomeExpense[]> = {
    success: true,
    message: "Income and expense comparison retrieved successfully",
    data: comparison,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const getDonationsByMonth = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
  const branchParam = parseBranchQuery(_req.query.branch);
  console.log("branchParam", branchParam);
  const branchFilter =
    branchParam != null ? { branch: branchParam } : undefined;
  // Aggregate donations by month and type
  const donationsByMonth = await Donation.aggregate([
    {
      $match: {
        donation_date: { $gte: yearStart, $lte: yearEnd },
        ...(branchFilter ?? {}),
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$donation_date" },
          type: "$donation_type",
        },
        total: { $sum: "$donation_amount" },
      },
    },
  ]);

  // Create a map for quick lookup: month -> type -> total
  const donationsMap = new Map<number, Map<number, number>>();

  for (const item of donationsByMonth) {
    const month = item._id.month;
    const type = item._id.type;
    const total = item.total;

    if (!donationsMap.has(month)) {
      donationsMap.set(month, new Map());
    }
    donationsMap.get(month)!.set(type, total);
  }

  // Build array with all 12 months
  const donations: MonthlyDonations[] = MONTH_NAMES.map((month, index) => {
    const monthData = donationsMap.get(index + 1);
    return {
      month,
      sadaqah: monthData?.get(1) || 0, // DonationType.SADAQAH = 1
      zakat: monthData?.get(2) || 0, // DonationType.ZAKAT = 2
      membership: monthData?.get(3) || 0, // DonationType.MEMBERSHIP = 3
      others: monthData?.get(4) || 0, // DonationType.OTHERS = 4
    };
  });

  const response: ApiResponse<MonthlyDonations[]> = {
    success: true,
    message: "Donations by month retrieved successfully",
    data: donations,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
