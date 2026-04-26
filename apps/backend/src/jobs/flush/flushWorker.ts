import { Worker } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";
import { bulkUpdateClicks } from "../../services/urlService.js";
import { redis } from "../../lib/redis.js";
import { logger } from "../../lib/logger.js";

export const flushWorker = new Worker(
  "flush-clicks",
  async () => {
    try {
      const clicksData = await redis.hGetAll("clicks");
      const clicks: Record<string, number> = {};
      for (const [shortId, count] of Object.entries(clicksData)) {
        clicks[shortId] = parseInt(count, 10);
      }
      await bulkUpdateClicks(clicks);
      await redis.del("clicks");
    } catch (err) {
      logger.error({ err }, "Error flushing clicks");
    }
  },
  {
    connection: bullmqConnection,
  },
);

export const startFlushWorker = async (): Promise<void> => {
  await flushWorker.run();
};

flushWorker.on("completed", () => {
  logger.info("Flush completed");
});

flushWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "Flush job failed");
});

flushWorker.on("error", (err) => {
  logger.error({ err }, "Flush worker error");
});
