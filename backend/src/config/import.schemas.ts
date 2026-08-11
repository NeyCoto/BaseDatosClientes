import { z } from "zod";

/**
 * Validates a single Excel row.
 * status has been removed — customers are simple contact records.
 */
export const importRowSchema = z.object({
  first_name: z
    .string({ required_error: "first_name is required" })
    .min(1, "first_name is required")
    .max(100, "first_name must be at most 100 characters")
    .trim(),

  last_name: z
    .string({ required_error: "last_name is required" })
    .min(1, "last_name is required")
    .max(100, "last_name must be at most 100 characters")
    .trim(),

  email: z
    .string()
    .email("Must be a valid email address")
    .max(255, "email must be at most 255 characters")
    .toLowerCase()
    .trim()
    .optional(),

  phone: z
    .string()
    .max(30, "phone must be at most 30 characters")
    .trim()
    .optional(),

  company: z
    .string()
    .max(255, "company must be at most 255 characters")
    .trim()
    .optional(),

  country: z
    .string()
    .max(100, "country must be at most 100 characters")
    .trim()
    .optional(),

  city: z
    .string()
    .max(100, "city must be at most 100 characters")
    .trim()
    .optional(),

  campaign: z
    .string()
    .max(255, "campaign name must be at most 255 characters")
    .trim()
    .optional(),
});

export type ImportRowInput = z.infer<typeof importRowSchema>;
