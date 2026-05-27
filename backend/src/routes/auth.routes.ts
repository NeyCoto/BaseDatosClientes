import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { register, login, getMe } from "../controllers/auth.controller";

const router = Router();

/**
 * Auth routes — mounted at /api/auth in server.ts
 *
 *   POST /api/auth/register   — create a new account (returns user + token)
 *   POST /api/auth/login      — log in (returns user + token)
 *   GET  /api/auth/me         — get current user profile (requires token)
 */

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
