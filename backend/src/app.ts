import { createApp } from "./server";
import { connectDatabase, closeDatabase } from "./config/db";
import { env } from "./config/env";

async function main(): Promise<void> {
  // 1. Verify DB connection before accepting traffic
  await connectDatabase();

  // 2. Boot Express
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀  Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
    );
  });

  // ─── Graceful shutdown ───────────────────────────────────────────────────
  // Render sends SIGTERM when deploying a new version or scaling down.
  // We stop accepting connections, finish in-flight requests, then close the DB.

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down gracefully…`);

    server.close(async () => {
      console.log("🔒  HTTP server closed");
      await closeDatabase();
      process.exit(0);
    });

    // Force exit if shutdown takes too long
    setTimeout(() => {
      console.error("⏰  Shutdown timeout — forcing exit");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  // ─── Unhandled rejection safety net ─────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
    // In production, crash loudly so Render restarts the service
    if (env.NODE_ENV === "production") process.exit(1);
  });
}

main().catch((err: unknown) => {
  console.error("❌  Failed to start server:", err);
  process.exit(1);
});
