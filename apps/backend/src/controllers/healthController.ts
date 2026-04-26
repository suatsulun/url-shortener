import { Request, Response } from "express";
import { db } from "../db/index.js";
import { redis } from "../lib/redis.js";
import { sql } from "drizzle-orm";

const probeDatabase = async () => {
  try {
    await Promise.race([
      db.execute(sql`SELECT 1`),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Database connection timeout")),
          2000,
        ),
      ),
    ]);
    return "ok";
  } catch {
    return "error";
  }
};

const probeRedis = async () => {
  try {
    await Promise.race([
      redis.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 2000),
      ),
    ]);
    return "ok";
  } catch {
    return "error";
  }
};

export const healthCheck = async (req: Request, res: Response) => {
  const databaseStatus = await probeDatabase();
  const redisStatus = await probeRedis();

  const allOk = databaseStatus === "ok" && redisStatus === "ok";
  const statusCode = allOk ? 200 : 503;

  res.status(statusCode).json({
    status: allOk ? "ok" : "degraded",
    dependencies: {
      database: databaseStatus,
      redis: redisStatus,
    },
    uptime: process.uptime(),
  });
};
