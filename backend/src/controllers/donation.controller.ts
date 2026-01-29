import { type Request, type Response } from "express";
import mongoose from "mongoose";

import { HttpStatus } from "../config/constants";
import { type AuthenticatedAdmin } from "../middlewares/auth/types";
import { Donation } from "../models/donation/donation.model";
import type {
  CreateDonationInput,
  UpdateDonationInput,
  DonationListItem,
} from "../models/donation/types";
import { type ApiResponse, type PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";

export const getDonations = async (
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
      filter.donation_date = { $gte: startDate, $lte: endDate };
    } else {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filter.donation_date = { $gte: startDate, $lte: endDate };
    }
  } else if (month) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 0, 23, 59, 59);
    filter.donation_date = { $gte: startDate, $lte: endDate };
  }

  if (branch) {
    filter.branch = branch;
  }

  if (type) {
    filter.donation_type = type;
  }

  const limit = 10000;
  const skip = (page - 1) * limit;

  const [donations, total, totalSum] = await Promise.all([
    Donation.find(filter)
      .select(
        "_id branch donation_type fullname phone_number donation_amount donation_date notes admin_id createdAt updatedAt",
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
      .sort({ donation_date: -1 })
      .lean(),
    Donation.countDocuments(filter),
    Donation.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$donation_amount" } } },
    ]),
  ]);

  const pages = Math.ceil(total / limit);

  const paginationResult: PaginationResult<DonationListItem> = {
    docs: donations as unknown as DonationListItem[],
    total,
    totalAmount: totalSum[0]?.total || 0,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<DonationListItem>> = {
    success: true,
    message: "Donations retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const createDonation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const {
    branch,
    donation_type,
    fullname,
    phone_number,
    donation_amount,
    donation_date,
    notes,
  }: CreateDonationInput = req.body;

  const donationDate = new Date(donation_date);
  if (Number.isNaN(donationDate.getTime())) {
    throw new AppError("Invalid donation date", HttpStatus.BAD_REQUEST);
  }

  const adminObjectId = new mongoose.Types.ObjectId(admin.sub);

  await Donation.create({
    admin_id: adminObjectId,
    branch,
    donation_type,
    fullname,
    phone_number,
    donation_amount,
    donation_date: donationDate,
    notes,
  });

  const response: ApiResponse = {
    success: true,
    message: "Donation created successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
};

export const updateDonation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid donation ID format", HttpStatus.BAD_REQUEST);
  }

  const {
    branch,
    donation_type,
    fullname,
    phone_number,
    donation_amount,
    donation_date,
    notes,
  }: UpdateDonationInput = req.body;

  const donationDate = new Date(donation_date);
  if (Number.isNaN(donationDate.getTime())) {
    throw new AppError("Invalid donation date", HttpStatus.BAD_REQUEST);
  }

  const updated = await Donation.findByIdAndUpdate(
    id,
    {
      $set: {
        branch,
        donation_type,
        fullname,
        phone_number,
        donation_amount,
        donation_date: donationDate,
        notes,
      },
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError("Donation not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Donation updated successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const deleteDonation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid donation ID format", HttpStatus.BAD_REQUEST);
  }

  const deleted = await Donation.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Donation not found", HttpStatus.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: "Donation deleted successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};
