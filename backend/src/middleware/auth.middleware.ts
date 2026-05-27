import { Request, Response, NextFunction } from "express";
import { extractBearerToken, verifyToken } from "../config/jwt";
import { UserRole } from "../types/auth.types";
import { AppError } from "../types";

// ─── authenticate ─────────────────────────────────────────────────────────────
// Verifies the JWT and attaches the decoded user to req.user.
// Add this to any route that requires a logged-in user.
//
// Usage: router.get("/protected", authenticate, myController)

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyToken(token);

    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

// ─── authorize ────────────────────────────────────────────────────────────────
// Role guard — always use AFTER authenticate.
//
// Usage: router.delete("/users/:id", authenticate, authorize("admin"), myController)

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(`Access denied. Requires role: ${allowedRoles.join(" or ")}`, 403));
      return;
    }

    next();
  };
}
