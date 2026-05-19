import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  register,
  login,
  refresh,
  getMe,
  logout,
} from "../controllers/auth.controller";

const router = Router();

/**
 * Auth routes — mounted at /api/auth in server.ts
 *
 * Public:
 *   POST /api/auth/register   — create a new account
 *   POST /api/auth/login      — authenticate and receive tokens
 *   POST /api/auth/refresh    — exchange a refresh token for a new token pair
 *
 * Protected (requires valid access token):
 *   GET  /api/auth/me         — get the currently authenticated user's profile
 *   POST /api/auth/logout     — stateless logout (client discards tokens)
 */

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
