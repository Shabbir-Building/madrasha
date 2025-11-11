import { z } from "zod";

const dateStringSchema = z
  .string()
  .min(1, "Donation date is required")
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date format");

export const createDonationSchema = z.object({
  branch: z.number().int().min(1, "Branch is required"),
  donation_type: z
    .number()
    .int()
    .min(1, "Donation type is required")
    .max(4, "Invalid donation type"),
  fullname: z
    .string()
    .min(1, "Fullname is required")
    .max(100, "Fullname must not exceed 100 characters"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .max(15, "Phone number must not exceed 15 characters"),
  donation_amount: z.number().min(0, "Amount must be zero or greater"),
  donation_date: dateStringSchema,
  notes: z.string().max(255, "Notes must not exceed 255 characters").optional(),
});

export const updateDonationSchema = createDonationSchema;
