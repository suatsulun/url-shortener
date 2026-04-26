import { Worker } from "bullmq";
import { cleanupExpiredUrls } from "../../services/urlService.js";
import { bullmqConnection } from "../bullmqConnection.js";
import { logger } from "../../lib/logger.js";

export const cleanupWorker = new Worker(
  "url-cleanup",
  async () => {
    logger.info("Cleaning up expired URLs");
    const cleaned = await cleanupExpiredUrls();
    logger.info({ cleaned }, "Cleanup completed");
  },
  { connection: bullmqConnection, concurrency: 1 },
);

cleanupWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "Cleanup job failed");
});

cleanupWorker.on("error", (err) => {
  logger.error({ err }, "Cleanup worker error");
});
