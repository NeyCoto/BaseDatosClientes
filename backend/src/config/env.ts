import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * Zod schema for all required environment variables.
 * The app crashes at startup — not at runtime — if anything is missing or wrong.
 *
 * UPDATED: Added JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.
 * Replace your existing src/config/env.ts with this file.
 */
const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3001),

  // ── Database ─────────────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z
    .string()
    .min(1, "CORS_ORIGIN is required")
    .default("http://localhost:5173"),

  // ── Rate limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // ── JWT ───────────────────────────────────────────────────────────────────
  // Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
