import { Worker } from "bullmq";
import { bullmqConnection } from "../bullmqConnection.js";
import {redis, cfExists, CF_KEYS } from "../../lib/redis.js";
import { nanoid } from "nanoid";

const POOL_KEY = "shortIdPool";
const TARGET_SIZE = 1000;
const THRESHOLD = 300;

const generateAndFilterIds = async (needed:number ): Promise<string[]> => {
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

export const idGenWorker = new Worker("id-gen", async (job) => {
    const currentSize = await redis.lLen(POOL_KEY);

        if (currentSize >= THRESHOLD) {
    process.stdout.write(`\r[ID Gen] Pool is healthy with ${currentSize} items.`);
    return;
        }
    const needed = TARGET_SIZE - currentSize;
    const validIds = await generateAndFilterIds(needed);
    if (validIds.length > 0) {
        await redis.rPush(POOL_KEY, validIds);
        console.log(`[ID Gen] Pool refilled with ${validIds.length} IDs.`);
    }
    }, {
        connection: bullmqConnection,
        concurrency: 1,
    }

);

idGenWorker.on("failed", (job, err) => {
    console.error(`ID gen job failed:`, err.message);
});

idGenWorker.on("error", (err) => {
    console.error(`ID gen worker error:`, err);
});