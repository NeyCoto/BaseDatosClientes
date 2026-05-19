import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { ApiResponse } from "../types";

const router = Router();

interface HealthData {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  database: "connected" | "unreachable";
}

/**
 * GET /health
 *
 * Render uses this route to determine if the service is healthy.
 * Returns 200 when the DB is reachable, 503 otherwise.
 */
router.get("/", async (_req: Request, res: Response) => {
  let dbStatus: HealthData["database"] = "unreachable";

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    dbStatus = "connected";
  } catch {
    // DB is down — still respond so Render sees a valid HTTP reply
  }

  const httpStatus = dbStatus === "connected" ? 200 : 503;
  const body: ApiResponse<HealthData> = {
    success: true,
    data: {
      status: dbStatus === "connected" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: dbStatus,
    },
  };

  res.status(httpStatus).json(body);
});

export default router;
