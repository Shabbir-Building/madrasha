import { type Request, type Response } from "express";
import mongoose from "mongoose";

import { HttpStatus, PAGINATION_DEFAULTS } from "../config/constants";
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
  res: Response
): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(req.query.limit) || 1000,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    Donation.find()
      .select(
        "_id branch donation_type fullname phone_number donation_amount donation_date notes admin_id createdAt updatedAt"
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
    Donation.countDocuments(),
  ]);

  const pages = Math.ceil(total / limit);

  const paginationResult: PaginationResult<DonationListItem> = {
    docs: donations as unknown as DonationListItem[],
    total,
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
  res: Response
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
  res: Response
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
    { new: true }
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
  res: Response
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
