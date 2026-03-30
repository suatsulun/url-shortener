import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

const CF_KEY = "shorturls";

const CF = {
    ADD: "CF.ADD",
    EXISTS: "CF.EXISTS",
    DEL: "CF.DEL",
};


redisClient = createClient({
    url: REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error("Redis reconnection failed");
            return Math.min(retries * 50, 2000);
    }
  }
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Redis Client Connecting..."));
redisClient.on("ready", () => console.log("Redis Client Ready"));
redisClient.on("reconnecting", () => console.log("Redis Client Reconnecting..."));
redisClient.on("end", () => console.log("Redis Client Disconnected"));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const cfAdd = async (shortId: string): Promise<void> => {
    await redisClient.sendCommand([CF.ADD, CF_KEY, shortId]);
}

export const cfExists = async (shortId: string): Promise<boolean> => {
    const result = await redisClient.sendCommand([CF.EXISTS, CF_KEY, shortId]);
    return !!result;
}

export const cfDel = async (shortId: string): Promise<void> => {
    await redisClient.sendCommand([CF.DEL, CF_KEY, shortId]);
}

export const redis = redisClient;