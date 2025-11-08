import { type Request, type Response } from "express";
import mongoose from "mongoose";

import { HttpStatus, PAGINATION_DEFAULTS } from "../config/constants";
import { type AuthenticatedAdmin } from "../middlewares/auth/types";
import { Income } from "../models/income/income.model";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeListItem,
} from "../models/income/types";
import { type ApiResponse, type PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";

export const getIncomes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(req.query.limit) || 1000,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  const [incomes, total] = await Promise.all([
    Income.find()
      .select(
        "_id branch type amount income_date notes admin_id createdAt updatedAt"
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
      .sort({ income_date: -1 })
      .lean(),
    Income.countDocuments(),
  ]);

  const pages = Math.ceil(total / limit);

  const paginationResult: PaginationResult<IncomeListItem> = {
    docs: incomes as unknown as IncomeListItem[],
    total,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<IncomeListItem>> = {
    success: true,
    message: "Incomes retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const getIncomeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid income ID format", HttpStatus.BAD_REQUEST);
  }

  const income = await Income.findById(id).lean();

  if (!income) {
    throw new AppError("Income not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse<IncomeListItem> = {
    success: true,
    message: "Income retrieved successfully",
    data: income as unknown as IncomeListItem,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const createIncome = async (
  req: Request,
  res: Response
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { branch, type, amount, income_date, notes }: CreateIncomeInput =
    req.body;

  const incomeDate = new Date(income_date);
  if (Number.isNaN(incomeDate.getTime())) {
    throw new AppError("Invalid income date", HttpStatus.BAD_REQUEST);
  }

  const adminObjectId = new mongoose.Types.ObjectId(admin.sub);

  await Income.create({
    admin_id: adminObjectId,
    branch,
    type,
    amount,
    income_date: incomeDate,
    notes,
  });

  const response: ApiResponse = {
    success: true,
    message: "Income created successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
};

export const updateIncome = async (
  req: Request,
  res: Response
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid income ID format", HttpStatus.BAD_REQUEST);
  }

  const { branch, type, amount, income_date, notes }: UpdateIncomeInput =
    req.body;

  const incomeDate = new Date(income_date);
  if (Number.isNaN(incomeDate.getTime())) {
    throw new AppError("Invalid income date", HttpStatus.BAD_REQUEST);
  }

  const updated = await Income.findByIdAndUpdate(
    id,
    {
      $set: {
        branch,
        type,
        amount,
        income_date: incomeDate,
        notes,
      },
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError("Income not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Income updated successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const deleteIncome = async (
  req: Request,
  res: Response
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid income ID format", HttpStatus.BAD_REQUEST);
  }

  const deleted = await Income.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Income not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Income deleted successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
