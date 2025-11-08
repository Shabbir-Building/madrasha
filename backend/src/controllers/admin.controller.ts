import { type Request, type Response } from "express";
import { HttpStatus, PAGINATION_DEFAULTS, UserRole } from "../config/constants";
import { type ApiResponse, type PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";
import { Admin } from "../models/admin/admin.model";
import { Employee } from "../models/employee/employee.model";
import { generateStrongPassword } from "../models/admin/utils";
import { hashPassword } from "../utils/password";
import type { CreateAdminInput, AdminListItem } from "../models/admin/types";
import mongoose from "mongoose";

const PHONE_NUMBER_TO_EXCLUDE = "01843676171";

export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    role,
    employee_id,
    access_boys_section,
    access_girls_section,
  }: CreateAdminInput = req.body;

  // Validate employee_id format before conversion
  if (!mongoose.Types.ObjectId.isValid(employee_id)) {
    throw new AppError("Invalid employee ID format", HttpStatus.BAD_REQUEST);
  }

  // Convert employee_id to ObjectId
  const employeeObjectId = new mongoose.Types.ObjectId(employee_id);

  const existingAdmin = await Admin.findOne({ employee_id: employeeObjectId });
  if (existingAdmin) {
    throw new AppError(
      "This employee is already an admin",
      HttpStatus.CONFLICT
    );
  }

  // Find the employee to get their details
  const employee = await Employee.findById(employeeObjectId);
  if (!employee) {
    throw new AppError("Employee not found", HttpStatus.NOT_FOUND);
  }

  const plainPassword = generateStrongPassword();
  const hashedPassword = await hashPassword(plainPassword);

  const admin = await Admin.create({
    role: role || UserRole.ADMIN,
    employee_id: employeeObjectId,
    password: hashedPassword,
    access_boys_section,
    access_girls_section,
  });

  const response: ApiResponse = {
    success: true,
    message: "Admin created successfully",
    data: {
      fullname: employee.fullname,
      phone_number: employee.phone_number,
      role: admin.role,
      createdAt: admin.createdAt,
      password: plainPassword,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
};

export const getAdmins = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(req.query.limit) || PAGINATION_DEFAULTS.LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  const basePipeline = [
    {
      $match: {
        $or: [{ disable: { $exists: false } }, { disable: { $ne: true } }],
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },
    {
      $match: {
        "employee.phone_number": { $ne: PHONE_NUMBER_TO_EXCLUDE },
      },
    },
  ];

  const [items, totalAggregation] = await Promise.all([
    Admin.aggregate([
      ...basePipeline,
      {
        $project: {
          _id: 1,
          fullname: "$employee.fullname",
          phone_number: "$employee.phone_number",
          role: 1,
          createdAt: 1,
          access_boys_section: 1,
          access_girls_section: 1,
          disable: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]).exec(),
    Admin.aggregate([...basePipeline, { $count: "total" }]).exec(),
  ]);

  const total = totalAggregation[0]?.total || 0;

  const pages = Math.ceil(total / limit) || 1;

  const paginationResult: PaginationResult<AdminListItem> = {
    docs: items as unknown as AdminListItem[],
    total,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<AdminListItem>> = {
    success: true,
    message: "Admins retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid admin ID format", HttpStatus.BAD_REQUEST);
  }

  const {
    access_boys_section,
    access_girls_section,
  }: {
    access_boys_section: boolean;
    access_girls_section: boolean;
  } = req.body;

  const updated = await Admin.findByIdAndUpdate(
    id,
    {
      $set: {
        access_boys_section,
        access_girls_section,
      },
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Admin updated successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const deleteAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid admin ID format", HttpStatus.BAD_REQUEST);
  }

  const deleted = await Admin.findByIdAndUpdate(
    id,
    {
      $set: {
        disable: true,
      },
    },
    { new: true }
  );

  if (!deleted) {
    throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Admin deleted successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
