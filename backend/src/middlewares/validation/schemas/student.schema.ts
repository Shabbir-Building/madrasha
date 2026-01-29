import { z } from "zod";

const dateStringSchema = z
  .string()
  .min(1, "Registration date is required")
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date format");

export const createStudentSchema = z
  .object({
    branch: z.number().int().positive("Branch is required"),
    profile_image: z.string().min(1).optional(),
    full_name: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name must not exceed 100 characters"),
    blood_group: z
      .string()
      .min(1, "Blood group is required")
      .max(10, "Blood group must not exceed 10 characters"),
    birth_certificate_no: z
      .string()
      .regex(
        /^[0-9]{10,17}$/i,
        "Birth certificate number must be 10-17 digits",
      ),
    gender: z
      .string()
      .min(1, "Gender is required")
      .max(20, "Gender must not exceed 20 characters"),
    registration_date: dateStringSchema,
    section: z.number().int().min(0).optional(),
    group: z
      .number()
      .int()
      .min(0, "Group must be zero or a positive number")
      .default(0),
    class: z.number().int().min(0).optional(),
    roll: z.number().int().min(1, "Roll must be a positive number"),
    current_location: z
      .string()
      .min(1, "Current location is required")
      .max(150, "Current location must not exceed 150 characters"),
    permanent_location: z
      .string()
      .min(1, "Permanent location is required")
      .max(150, "Permanent location must not exceed 150 characters"),
    day_care: z.boolean(),
    residential: z.boolean(),
    residential_category: z.string().optional(),
    residential_fee: z.number().min(0).optional().default(0),
    waiver_amount: z.number().min(0).optional().default(0),
    class_fee: z
      .number()
      .min(0, "Class fee must be non-negative")
      .optional()
      .default(0),
    guardian_name: z
      .string()
      .min(1, "Guardian name is required")
      .max(100, "Guardian name must not exceed 100 characters"),
    guardian_relation: z
      .string()
      .min(1, "Guardian relation is required")
      .max(50, "Guardian relation must not exceed 50 characters"),
    phone_number: z
      .string()
      .regex(/^01\d{9}$/, "Phone number must be 11 digits starting with 01"),
    alternative_phone_number: z
      .string()
      .regex(/^01\d{9}$/, "Phone number must be 11 digits starting with 01")
      .optional(),
    guardian_current_location: z
      .string()
      .min(1, "Guardian current location is required")
      .max(150, "Guardian current location must not exceed 150 characters"),
    guardian_permanent_location: z
      .string()
      .min(1, "Guardian permanent location is required")
      .max(150, "Guardian permanent location must not exceed 150 characters"),
    total: z.number().min(0).optional(),
    disable: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.residential && !data.residential_category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Residential category is required when residential is selected",
        path: ["residential_category"],
      });
    }

    if (!data.residential) {
      // Ensure residential-specific fields fall back to zero/undefined
      data.residential_category = undefined;
      data.residential_fee = 0;
    }
  });
