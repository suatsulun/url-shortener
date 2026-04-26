import { Worker } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";
import { redis, cfExists, CF_KEYS } from "../../lib/redis.js";
import { nanoid } from "nanoid";
import { logger } from "../../lib/logger.js";

const POOL_KEY = "shortIdPool";
const TARGET_SIZE = 1000;
const THRESHOLD = 300;

const generateAndFilterIds = async (needed: number): Promise<string[]> => {
  const validIds: string[] = [];
  const candidates = Array.from({ length: needed }, () => nanoid(6));
  for (const id of candidates) {
    const exists = await cfExists(CF_KEYS.SHORT_IDS, id);
    if (!exists) {
      validIds.push(id);
    }
  }
  return validIds;
};

export const idGenWorker = new Worker(
  "id-gen",
  async () => {
    const currentSize = await redis.lLen(POOL_KEY);

    if (currentSize >= THRESHOLD) {
      logger.debug({ poolSize: currentSize }, "ID pool healthy");
      return;
    }
    const needed = TARGET_SIZE - currentSize;
    const validIds = await generateAndFilterIds(needed);
    if (validIds.length > 0) {
      await redis.rPush(POOL_KEY, validIds);
      logger.info({ added: validIds.length }, "ID pool refilled");
    }
  },
  {
    connection: bullmqConnection,
    concurrency: 1,
  },
);

idGenWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "ID gen job failed");
});

idGenWorker.on("error", (err) => {
  logger.error({ err }, "ID gen worker error");
});
