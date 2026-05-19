import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * Lightweight request logger for development.
 * In production, replace this with a proper logger (e.g. pino, winston).
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (env.NODE_ENV === "production") {
    next();
    return;
  }

  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500 ? "\x1b[31m"   // red
      : status >= 400 ? "\x1b[33m" // yellow
      : status >= 300 ? "\x1b[36m" // cyan
      : "\x1b[32m";                // green
    const reset = "\x1b[0m";

    console.log(
      `${color}${method}${reset} ${originalUrl} ${color}${status}${reset} — ${duration}ms`
    );
  });

  next();
};
