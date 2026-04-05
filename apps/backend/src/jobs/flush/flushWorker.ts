import { Worker } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";
import { bulkUpdateClicks } from "../../services/urlService.js";
import {redis } from "../../lib/redis.js";

export const flushWorker = new Worker("flush-clicks", async (job) => {
    try {
        const clicksData = await redis.hGetAll("clicks");
        const clicks: Record<string, number> = {};
        for (const [shortId, count] of Object.entries(clicksData)) {
            clicks[shortId] = parseInt(count, 10);
        }
        await bulkUpdateClicks(clicks);
        await redis.del("clicks");
    } catch (error) {
        console.error("Error flushing clicks:", error);
    }
}, {
    connection: bullmqConnection,
});

export const startFlushWorker = async (): Promise<void> => {
    await flushWorker.run();
};

flushWorker.on("completed", (job) => {
    console.log(`Flush completed at ${new Date().toLocaleTimeString()}`);
});

flushWorker.on("failed", (jobId, err) => {
    console.error(`Flush job ${jobId} failed with error:`, err);
});

flushWorker.on("error", (err) => {
    console.error("Flush worker error:", err);
});