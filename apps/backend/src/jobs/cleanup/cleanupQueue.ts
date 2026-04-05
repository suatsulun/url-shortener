import { Queue } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";

export const cleanupQueue = new Queue("url-cleanup", { connection: bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
    },
 });

export const startCleanupScheduler = async (): Promise<void> => {
    await cleanupQueue.add("cleanup-now", {});

    await cleanupQueue.upsertJobScheduler(
        "cleanup-daily-3am",
        { pattern: "0 3 * * *"}
    );
};