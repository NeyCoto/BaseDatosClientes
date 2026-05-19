import { Request, Response, NextFunction } from "express";
import { extractBearerToken, verifyAccessToken } from "../config/jwt";
import { UserRole } from "../types/auth.types";
import { AppError } from "../types";

// ─── authenticate ─────────────────────────────────────────────────────────────
//
// Verifies the Bearer token in the Authorization header and attaches the decoded
// user to req.user. Throws 401 if the token is missing, invalid, or expired.
//
// Usage:
//   router.get("/protected", authenticate, myController);

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

// ─── authorize ────────────────────────────────────────────────────────────────
//
// Role-based access control. Must be used AFTER authenticate.
// Accepts one or more allowed roles.
//
// Usage:
//   router.delete("/users/:id", authenticate, authorize("admin"), myController);
//   router.get("/report",       authenticate, authorize("admin", "user"), myController);

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Defensive check — authenticate should always run first
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
          403
        )
      );
      return;
    }

    next();
  };
}

// ─── requireSelf ──────────────────────────────────────────────────────────────
//
// Allows a user to access their own resource, OR an admin to access any resource.
// Reads the target user id from req.params.id by default.
//
// Usage:
//   router.get("/users/:id", authenticate, requireSelf, myController);

export function requireSelf(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const targetId = req.params["id"];
  const isOwnResource = req.user.id === targetId;
  const isAdmin = req.user.role === "admin";

  if (!isOwnResource && !isAdmin) {
    next(new AppError("You can only access your own resources", 403));
    return;
  }

  next();
}
