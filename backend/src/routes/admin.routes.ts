import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize, requireSelf } from "../middleware/auth.middleware";
import { findAllUsers, updateUserRole, updateUserActiveStatus } from "../repositories/user.repository";
import { AppError, ApiResponse } from "../types";
import { SafeUser, UserRole, USER_ROLES } from "../types/auth.types";
import { z } from "zod";

const router = Router();

/**
 * Admin routes — mounted at /api/admin in server.ts
 * ALL routes require: authenticated + admin role
 *
 *   GET    /api/admin/users            — list all users
 *   GET    /api/admin/users/:id        — get one user (admin OR self)
 *   PATCH  /api/admin/users/:id/role   — change a user's role
 *   PATCH  /api/admin/users/:id/status — activate / deactivate a user
 */

// Apply authenticate + authorize("admin") to every route in this router
router.use(authenticate, authorize("admin"));

// ── GET /api/admin/users ──────────────────────────────────────────────────────

router.get(
  "/users",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users: SafeUser[] = await findAllUsers();
      const body: ApiResponse<SafeUser[]> = { success: true, data: users };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────

const roleSchema = z.object({
  role: z.enum(USER_ROLES),
});

router.patch(
  "/users/:id/role",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = roleSchema.parse(req.body);
      const { id } = req.params;

      if (!id) {
        throw new AppError("User id is required", 400);
      }

      const updated: SafeUser | null = await updateUserRole(id, role as UserRole);
      if (!updated) {
        throw new AppError("User not found", 404);
      }

      const body: ApiResponse<SafeUser> = {
        success: true,
        data: updated,
        message: `Role updated to "${role}"`,
      };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/admin/users/:id/status ─────────────────────────────────────────

const statusSchema = z.object({
  is_active: z.boolean(),
});

router.patch(
  "/users/:id/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { is_active } = statusSchema.parse(req.body);
      const { id } = req.params;

      if (!id) {
        throw new AppError("User id is required", 400);
      }

      await updateUserActiveStatus(id, is_active);

      const body: ApiResponse<{ id: string; is_active: boolean }> = {
        success: true,
        data: { id, is_active },
        message: `User ${is_active ? "activated" : "deactivated"} successfully`,
      };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
