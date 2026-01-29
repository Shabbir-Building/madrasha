import { type Request, type Response } from "express";
import mongoose from "mongoose";

import { HttpStatus } from "../config/constants";
import { type AuthenticatedAdmin } from "../middlewares/auth/types";
import { Expense } from "../models/expense/expense.model";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListItem,
} from "../models/expense/types";
import { type ApiResponse, type PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";

export const getExpenses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = 1;
  const year = req.query.year
    ? Number.parseInt(req.query.year as string, 10)
    : null;
  const month = req.query.month
    ? Number.parseInt(req.query.month as string, 10)
    : null;
  const branch = req.query.branch
    ? Number.parseInt(req.query.branch as string, 10)
    : null;
  const type = req.query.type
    ? Number.parseInt(req.query.type as string, 10)
    : null;

  const filter: any = {};

  if (year) {
    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.expense_date = { $gte: startDate, $lte: endDate };
    } else {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filter.expense_date = { $gte: startDate, $lte: endDate };
    }
  } else if (month) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 0, 23, 59, 59);
    filter.expense_date = { $gte: startDate, $lte: endDate };
  }

  if (branch) {
    filter.branch = branch;
  }

  if (type) {
    filter.type = type;
  }

  const limit = 10000;
  const skip = (page - 1) * limit;

  const [expenses, total, totalSum] = await Promise.all([
    Expense.find(filter)
      .select(
        "_id branch type amount expense_date notes admin_id createdAt updatedAt",
      )
      .populate({
        path: "admin_id",
        select: "employee_id",
        populate: {
          path: "employee_id",
          select: "fullname",
        },
      })
      .limit(limit)
      .skip(skip)
      .sort({ expense_date: -1 })
      .lean(),
    Expense.countDocuments(filter),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const pages = Math.ceil(total / limit);

  const paginationResult: PaginationResult<ExpenseListItem> = {
    docs: expenses as unknown as ExpenseListItem[],
    total,
    totalAmount: totalSum[0]?.total || 0,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<ExpenseListItem>> = {
    success: true,
    message: "Expenses retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const createExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { branch, type, amount, expense_date, notes }: CreateExpenseInput =
    req.body;

  const expenseDate = new Date(expense_date);
  if (Number.isNaN(expenseDate.getTime())) {
    throw new AppError("Invalid expense date", HttpStatus.BAD_REQUEST);
  }

  const adminObjectId = new mongoose.Types.ObjectId(admin.sub);

  await Expense.create({
    admin_id: adminObjectId,
    branch,
    type,
    amount,
    expense_date: expenseDate,
    notes,
  });

  const response: ApiResponse = {
    success: true,
    message: "Expense created successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
};

export const updateExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid expense ID format", HttpStatus.BAD_REQUEST);
  }

  const { branch, type, amount, expense_date, notes }: UpdateExpenseInput =
    req.body;

  const expenseDate = new Date(expense_date);
  if (Number.isNaN(expenseDate.getTime())) {
    throw new AppError("Invalid expense date", HttpStatus.BAD_REQUEST);
  }

  const updated = await Expense.findByIdAndUpdate(
    id,
    {
      $set: {
        branch,
        type,
        amount,
        expense_date: expenseDate,
        notes,
      },
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError("Expense not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Expense updated successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const deleteExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid expense ID format", HttpStatus.BAD_REQUEST);
  }

  const deleted = await Expense.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Expense not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Expense deleted successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
