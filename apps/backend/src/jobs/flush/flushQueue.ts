import { Queue } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";

export const flushQueue = new Queue("flush-clicks", {
    connection: bullmqConnection,
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

export const startFlushScheduler = async (): Promise<void> => {
    await flushQueue.upsertJobScheduler(
        "flush-clicks-scheduler",
        { every: 60000 },
    );
};