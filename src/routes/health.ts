import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/client.ts";

const healthRouter = Router();

healthRouter.get("/health", async (req, res) => {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: "up",
      database: {
        status: "up",
        latency: `${Date.now() - start}ms`,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "up",
      database: {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

export default healthRouter;
