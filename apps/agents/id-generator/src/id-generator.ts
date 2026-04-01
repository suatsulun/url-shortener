import { Redis } from "ioredis";
import { nanoid } from "nanoid";
import 'dotenv/config';

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const POOL_KEY = "shortIdPool";
const TARGET_SIZE = 1000;
const TRESHOLD = 300;
const CHECK_INTERVAL = 10000;

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
}); 

const generateBatch = (count: number): string[] => {
    return Array.from({ length: count }, () => nanoid(6));
}

async function refillPool() {
    try {
    const currentSize = await redis.llen(POOL_KEY);
    if (currentSize < TRESHOLD) {
        const needed = TARGET_SIZE - currentSize;
        const newIds = generateBatch(needed);
        await redis.rpush(POOL_KEY, ...newIds);
        console.log(`[SUCCESS] Pool refilled to ${TARGET_SIZE}.`);
    } else {
            console.log(`[SKIP] Pool healty at ${currentSize}.`);
    }
} catch (error) {
    console.error("[ERROR] Failed to refill pool:", error);
}
}

console.log("🚀 ShortID Refiller Agent is live and monitoring Redis...");
const interval = setInterval(refillPool, CHECK_INTERVAL);

const shutdown = async () => {
    console.log("Shutting down ShortID Refiller Agent...");
    clearInterval(interval);
    await redis.quit();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);