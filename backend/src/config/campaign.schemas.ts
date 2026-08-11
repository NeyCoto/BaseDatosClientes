import { z } from "zod";

// ─── Reusable date string validator ──────────────────────────────────────────
// Accepts YYYY-MM-DD strings (what HTML date inputs produce).

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional();

// ─── POST /api/campaigns ──────────────────────────────────────────────────────

export const createCampaignSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters")
      .trim(),

    description: z.string().trim().optional(),

    start_date: dateString,
    end_date: dateString,

    is_active: z.boolean().default(true),
  })

// ─── PUT /api/campaigns/:id ───────────────────────────────────────────────────
// Same shape as create — all fields editable.

export const updateCampaignSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters")
      .trim(),

    description: z.string().trim().optional(),

    start_date: dateString,
    end_date: dateString,

    is_active: z.boolean(),
  })

// ─── GET /api/campaigns — query string params ─────────────────────────────────

export const campaignListQuerySchema = z.object({
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

  // Accept "true"/"false" strings from query params and coerce to boolean
  is_active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

// ─── Route param :id ─────────────────────────────────────────────────────────

export const campaignIdParamSchema = z.object({
  id: z.string().uuid("Campaign ID must be a valid UUID"),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignListQueryInput = z.infer<typeof campaignListQuerySchema>;
export type CampaignIdParamInput = z.infer<typeof campaignIdParamSchema>;
