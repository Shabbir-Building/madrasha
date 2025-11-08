import { type Request, type Response } from "express";
import { HttpStatus, PAGINATION_DEFAULTS } from "../config/constants";
import { ApiResponse, PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";
import { Employee } from "../models/employee/employee.model";
import mongoose from "mongoose";

import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListItem,
  EmployeeDetails,
} from "../models/employee/types";

const PHONE_NUMBER_TO_EXCLUDE = "01843676171";

export const createEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    branch,
    employment_type,
    designation,
    fullname,
    profile_image,
    nid_no,
    gender,
    phone_number,
    join_date,
    resign_date,
    salary,
    bonus,
    current_location,
    permanent_location,
  }: CreateEmployeeInput = req.body;

  // Check if employee with same phone number exists
  const existingEmployee = await Employee.findOne({ phone_number });
  if (existingEmployee) {
    throw new AppError(
      "Employee with this phone number already exists",
      HttpStatus.CONFLICT
    );
  }

  // Create new employee
  await Employee.create({
    branch,
    employment_type,
    designation,
    fullname,
    profile_image,
    nid_no,
    gender,
    phone_number,
    join_date: new Date(join_date),
    resign_date: resign_date ? new Date(resign_date) : undefined,
    salary,
    bonus: bonus || 0,
    current_location,
    permanent_location,
  });

  const response: ApiResponse = {
    success: true,
    message: "Employee created successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
};

export const getEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(req.query.limit) || 15,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  const filter = {
    phone_number: { $ne: PHONE_NUMBER_TO_EXCLUDE },
    $or: [{ disable: { $exists: false } }, { disable: { $ne: true } }],
  };

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .select(
        "_id fullname employment_type designation branch join_date phone_number"
      )
      .limit(limit)
      .skip(skip)
      .lean(),
    Employee.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);

  const paginationResult: PaginationResult<EmployeeListItem> = {
    docs: employees as unknown as EmployeeListItem[],
    total,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<EmployeeListItem>> = {
    success: true,
    message: "Employees retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid employee ID format", HttpStatus.BAD_REQUEST);
  }

  const employee = await Employee.findOne({
    _id: id,
    $or: [{ disable: { $exists: false } }, { disable: { $ne: true } }],
  }).lean();

  if (!employee) {
    throw new AppError("Employee not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse<EmployeeDetails> = {
    success: true,
    message: "Employee retrieved successfully",
    data: employee as unknown as EmployeeDetails,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const updateEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid employee ID format", HttpStatus.BAD_REQUEST);
  }

  const updateData: Partial<UpdateEmployeeInput> = req.body;

  // If phone number is being updated, check if it already exists
  if (updateData.phone_number) {
    const existingEmployee = await Employee.findOne({
      phone_number: updateData.phone_number,
      _id: { $ne: id },
    });
    if (existingEmployee) {
      throw new AppError(
        "Employee with this phone number already exists",
        HttpStatus.CONFLICT
      );
    }
  }

  // Prepare the update object, handling date conversions
  const updateObject: Record<string, unknown> = {};

  if (updateData.branch !== undefined) updateObject.branch = updateData.branch;
  if (updateData.employment_type !== undefined)
    updateObject.employment_type = updateData.employment_type;
  if (updateData.designation !== undefined)
    updateObject.designation = updateData.designation;
  if (updateData.fullname !== undefined)
    updateObject.fullname = updateData.fullname;
  if (updateData.profile_image !== undefined)
    updateObject.profile_image = updateData.profile_image;
  if (updateData.nid_no !== undefined) updateObject.nid_no = updateData.nid_no;
  if (updateData.gender !== undefined) updateObject.gender = updateData.gender;
  if (updateData.phone_number !== undefined)
    updateObject.phone_number = updateData.phone_number;
  if (updateData.salary !== undefined) updateObject.salary = updateData.salary;
  if (updateData.bonus !== undefined) updateObject.bonus = updateData.bonus;
  if (updateData.current_location !== undefined)
    updateObject.current_location = updateData.current_location;
  if (updateData.permanent_location !== undefined)
    updateObject.permanent_location = updateData.permanent_location;
  if (typeof updateData.disable === "boolean") {
    updateObject.disable = updateData.disable;
  }

  // Handle date conversions
  if (updateData.join_date !== undefined) {
    updateObject.join_date = new Date(updateData.join_date);
  }
  if (updateData.resign_date !== undefined) {
    updateObject.resign_date = updateData.resign_date
      ? new Date(updateData.resign_date)
      : undefined;
  }

  const updated = await Employee.findByIdAndUpdate(
    id,
    {
      $set: updateObject,
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError("Employee not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Employee updated successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
