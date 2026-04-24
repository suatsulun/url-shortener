import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis} from "./lib/redis.js";
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

const app = express();

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
    console.log(`Server is running on port ${PORT}`);
  });
};

start();

export default app;
