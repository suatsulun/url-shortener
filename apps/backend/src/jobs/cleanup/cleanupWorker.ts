import { Worker } from "bullmq";
import { cleanupExpiredUrls } from "../../services/urlService.js";
import { bullmqConnection } from "../bullmqConnection.js";

export const cleanupWorker = new Worker("url-cleanup", async (job) => {
    console.log("Cleaning up expired URLs...");
    const cleaned = await cleanupExpiredUrls();
    console.log(`Cleaning completed at ${new Date().toISOString()}.${cleaned} URLs removed`);
}, { connection: bullmqConnection, 
    concurrency: 1,
});

cleanupWorker.on("failed", (job, err) => {
    console.error(`Cleanup job failed: `, err.message)
});

cleanupWorker.on("error", (err) => {
    console.error("Cleanup worker error:", err);
});