import { z } from "zod";

// ─── POST /api/customers ──────────────────────────────────────────────────────

export const createCustomerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must be at most 100 characters")
      .trim(),

    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name must be at most 100 characters")
      .trim(),

    phone: z
      .string()
      .max(30, "Phone must be at most 30 characters")
      .trim()
      .optional(),

    email: z
      .string()
      .email("Must be a valid email address")
      .max(255, "Email must be at most 255 characters")
      .toLowerCase()
      .trim(),

    alternative_email: z
      .string()
      .email("Alternative email must be valid")
      .max(255, "Alternative email must be at most 255 characters")
      .toLowerCase()
      .trim()
      .optional(),

    country: z
      .string()
      .max(100, "Country must be at most 100 characters")
      .trim()
      .optional(),

    city: z
      .string()
      .max(100, "City must be at most 100 characters")
      .trim()
      .optional(),

    campaign_id: z
      .string()
      .uuid("campaign_id must be a valid UUID")
      .optional(),
  })
  .refine(
    (data) =>
      data.alternative_email === undefined ||
      data.alternative_email !== data.email,
    {
      message: "Alternative email must be different from the primary email",
      path: ["alternative_email"],
    }
  );

// ─── PUT /api/customers/:id ───────────────────────────────────────────────────

export const updateCustomerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must be at most 100 characters")
      .trim(),

    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name must be at most 100 characters")
      .trim(),

    phone: z
      .string()
      .max(30, "Phone must be at most 30 characters")
      .trim()
      .optional(),

    email: z
      .string()
      .email("Must be a valid email address")
      .max(255, "Email must be at most 255 characters")
      .toLowerCase()
      .trim(),

    alternative_email: z
      .string()
      .email("Alternative email must be valid")
      .max(255, "Alternative email must be at most 255 characters")
      .toLowerCase()
      .trim()
      .optional(),

    country: z
      .string()
      .max(100, "Country must be at most 100 characters")
      .trim()
      .optional(),

    city: z
      .string()
      .max(100, "City must be at most 100 characters")
      .trim()
      .optional(),

    // null explicitly unlinks the customer from any campaign
    campaign_id: z
      .string()
      .uuid("campaign_id must be a valid UUID")
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.alternative_email === undefined ||
      data.alternative_email !== data.email,
    {
      message: "Alternative email must be different from the primary email",
      path: ["alternative_email"],
    }
  );

// ─── GET /api/customers — query string params ─────────────────────────────────

export const customerListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10),

  search: z.string().max(100, "Search term too long").trim().optional(),

  campaign_id: z.string().uuid("campaign_id must be a valid UUID").optional(),
});

// ─── Route param :id ─────────────────────────────────────────────────────────

export const customerIdParamSchema = z.object({
  id: z.string().uuid("Customer ID must be a valid UUID"),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQueryInput = z.infer<typeof customerListQuerySchema>;
export type CustomerIdParamInput = z.infer<typeof customerIdParamSchema>;
