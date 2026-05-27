import { z } from "zod";
import { USER_ROLES } from "../types/auth.types";

// ─── POST /api/admin/users ────────────────────────────────────────────────────

export const adminCreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters"),

  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${USER_ROLES.join(", ")}` }),
  }),
});

// ─── GET /api/admin/users — query string params ───────────────────────────────

export const userListQuerySchema = z.object({
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

  search: z
    .string()
    .max(50, "Search term too long")
    .trim()
    .optional(),

  role: z.enum(USER_ROLES).optional(),
});

// ─── DELETE /api/admin/users/:id — route param ────────────────────────────────

export const userIdParamSchema = z.object({
  id: z
    .string()
    .uuid("User ID must be a valid UUID"),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type UserListQueryInput   = z.infer<typeof userListQuerySchema>;
export type UserIdParamInput     = z.infer<typeof userIdParamSchema>;
