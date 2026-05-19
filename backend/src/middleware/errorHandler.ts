import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, ApiErrorResponse } from "../types";
import { env } from "../config/env";

/**
 * Central error handler — must be registered LAST with app.use().
 * Catches AppError, ZodError (validation), and unknown errors.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ── Zod validation errors (from request body parsing) ──────────────────────
  if (err instanceof ZodError) {
    const details = err.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    const body: ApiErrorResponse = {
      success: false,
      error: "Validation error",
      details,
    };
    res.status(400).json(body);
    return;
  }

  // ── Known application errors ───────────────────────────────────────────────
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Unexpected errors ──────────────────────────────────────────────────────
  // Never leak stack traces or internal details in production
  const isProduction = env.NODE_ENV === "production";

  console.error("Unhandled error:", err);

  const body: ApiErrorResponse = {
    success: false,
    error: "Internal server error",
    ...(isProduction
      ? {}
      : { details: [err instanceof Error ? err.message : String(err)] }),
  };

  res.status(500).json(body);
};

/**
 * Catch-all for routes that don't exist.
 * Register this just before the error handler.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const body: ApiErrorResponse = {
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
};
