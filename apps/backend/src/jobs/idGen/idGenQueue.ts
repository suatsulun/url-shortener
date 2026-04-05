import { Queue } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";

export const idGenQueue = new Queue("id-gen", {
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

export const startIdGenScheduler = async (): Promise<void> => {
    await idGenQueue.upsertJobScheduler(
        "flush-clicks-scheduler",
        { every: 10000 },
    );
};