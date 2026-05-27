import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  getUsersController,
  createUserController,
  deleteUserController,
} from "../controllers/user-admin.controller";

const router = Router();

/**
 * Admin User Management Routes
 * Mounted at: /api/admin/users  (register in server.ts)
 *
 * All routes require:
 *   1. A valid JWT (authenticate)
 *   2. The admin role (authorize)
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Method  │  Path                  │  Description                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  GET     │  /api/admin/users      │  List users (search, filter, page)  │
 * │  POST    │  /api/admin/users      │  Create a new user                  │
 * │  DELETE  │  /api/admin/users/:id  │  Delete a user by UUID              │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// Apply auth guards to every route in this router
router.use(authenticate, authorize("admin"));

router.get("/",     getUsersController);
router.post("/",    createUserController);
router.delete("/:id", deleteUserController);

export default router;
