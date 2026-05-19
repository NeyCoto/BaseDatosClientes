import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ─── Rate limiters ────────────────────────────────────────────────────────────

// General limiter for all routes
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests — please try again later" },
});

// Strict limiter specifically for auth routes to slow brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many auth attempts — please wait 15 minutes" },
});

// ─── App factory ─────────────────────────────────────────────────────────────

export function createApp(): Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(generalLimiter);

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // ── Dev logging ───────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use("/health", healthRoutes);
  app.use("/api/auth", authLimiter, authRoutes);   // stricter rate limit on auth
  app.use("/api/admin", adminRoutes);

  // Future feature routes slot in here:
  // app.use("/api/customers", authenticate, customerRoutes);
  // app.use("/api/campaigns", authenticate, campaignRoutes);

  // ── 404 + error handlers (must be last) ───────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
