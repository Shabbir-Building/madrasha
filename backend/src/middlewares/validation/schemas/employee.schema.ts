import { z } from "zod";

export const createEmployeeSchema = z.object({
  branch: z.number().int().positive("Branch must be a positive number"),
  employment_type: z.number().int().positive("Role must be a positive number"),
  designation: z
    .number()
    .int()
    .positive("Designation must be a positive number"),
  fullname: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters"),
  profile_image: z.string().optional(),
  nid_no: z.string().regex(/^\d{10}$/, "NID number must be exactly 10 digits"),
  gender: z
    .string()
    .min(1, "Gender is required")
    .max(20, "Gender must not exceed 20 characters"),
  phone_number: z
    .string()
    .regex(/^01\d{9}$/, "Phone number must be 11 digits starting with 01"),
  join_date: z
    .union([z.string().date(), z.string().datetime()])
    .refine(
      (v) => !Number.isNaN(new Date(v as string).getTime()),
      "Invalid join date format"
    ),
  resign_date: z
    .union([z.string().date(), z.string().datetime()])
    .refine(
      (v) => !v || !Number.isNaN(new Date(v as string).getTime()),
      "Invalid resign date format"
    )
    .optional(),
  salary: z
    .number()
    .min(0, "Bonus must be non-negative")
    .max(9999999999, "Salary must not exceed 10 digits"),
  bonus: z
    .number()
    .min(0, "Bonus must be non-negative")
    .max(9999999999, "Bonus must not exceed 10 digits")
    .optional(),
  current_location: z
    .string()
    .min(1, "Current location is required")
    .max(250, "Current location must not exceed 250 characters"),
  permanent_location: z
    .string()
    .min(1, "Permanent location is required")
    .max(250, "Permanent location must not exceed 250 characters"),
  disable: z.boolean().optional(),
});

export const updateEmployeeSchema = z.object({
  branch: z
    .number()
    .int()
    .positive("Branch must be a positive number")
    .optional(),
  employment_type: z
    .number()
    .int()
    .positive("Role must be a positive number")
    .optional(),
  designation: z
    .number()
    .int()
    .positive("Designation must be a positive number")
    .optional(),
  fullname: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
  profile_image: z.string().optional(),
  nid_no: z
    .string()
    .regex(/^\d{10}$/, "NID number must be exactly 10 digits")
    .optional(),
  gender: z
    .string()
    .min(1, "Gender is required")
    .max(20, "Gender must not exceed 20 characters")
    .optional(),
  phone_number: z
    .string()
    .regex(/^01\d{9}$/, "Phone number must be 11 digits starting with 01")
    .optional(),
  join_date: z
    .union([z.string().date(), z.string().datetime()])
    .refine(
      (v) => !v || !Number.isNaN(new Date(v as string).getTime()),
      "Invalid join date format"
    )
    .optional(),
  resign_date: z
    .union([z.string().date(), z.string().datetime()])
    .refine(
      (v) => !v || !Number.isNaN(new Date(v as string).getTime()),
      "Invalid resign date format"
    )
    .optional(),
  salary: z
    .number()
    .min(0, "Salary must be non-negative")
    .max(9999999999, "Salary must not exceed 10 digits")
    .optional(),
  bonus: z
    .number()
    .min(0, "Bonus must be non-negative")
    .max(9999999999, "Bonus must not exceed 10 digits")
    .optional(),
  current_location: z
    .string()
    .min(1, "Current location is required")
    .max(250, "Current location must not exceed 250 characters")
    .optional(),
  permanent_location: z
    .string()
    .min(1, "Permanent location is required")
    .max(250, "Permanent location must not exceed 250 characters")
    .optional(),
  disable: z.boolean().optional(),
});
