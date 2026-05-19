import { z } from "zod";
import { USER_ROLES } from "../types/auth.types";

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),

  email: z
    .string()
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters") // bcrypt hard limit
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  role: z.enum(USER_ROLES).optional().default("user"),
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string().min(1, "Password is required"),
});

// ─── Refresh token ────────────────────────────────────────────────────────────

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ─── Inferred types (used in controllers) ────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
