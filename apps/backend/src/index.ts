import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis } from "./lib/redis.js";
import userRouter from "./routes/users.js";
import urlRouter from "./routes/urls.js";
import "./jobs/flush/flushWorker.js";
import { startFlushScheduler } from "./jobs/flush/flushQueue.js";
import "./jobs/cleanup/cleanupWorker.js";
import { startCleanupScheduler } from "./jobs/cleanup/cleanupQueue.js";
import "./jobs/idGen/idGenWorker.js";
import { startIdGenScheduler } from "./jobs/idGen/idGenQueue.js";
import healthRouter from "./routes/health.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req: any) => req.url === "/api/health",
    },
    customLogLevel: (_req: any, res: any, err: any) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use("/api/users", userRouter);
app.use("/api/urls", urlRouter);
app.use("/api/health", healthRouter);

const start = async (): Promise<void> => {
  await connectRedis();
  await startFlushScheduler();
  await startCleanupScheduler();
  await startIdGenScheduler();
  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server is running");
  });
};

start();

export default app;
