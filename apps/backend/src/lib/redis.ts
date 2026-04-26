import { createClient } from "redis";
import { logger } from "./logger.js";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

export const CF_KEYS = {
  SHORT_IDS: "cf:shortIds",
  URL_HASHES: "cf:urlHashes",
};

const CF = {
  ADD: "CF.ADD",
  EXISTS: "CF.EXISTS",
  DEL: "CF.DEL",
};

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Redis reconnection failed");
      return Math.min(retries * 50, 2000);
    },
  },
});

redisClient.on("error", (err) => logger.error({ err }, "Redis client error"));
redisClient.on("connect", () => logger.info("Redis client connecting"));
redisClient.on("ready", () => logger.info("Redis client ready"));
redisClient.on("reconnecting", () => logger.warn("Redis client reconnecting"));
redisClient.on("end", () => logger.info("Redis client disconnected"));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const cfAdd = async (cfKey: string, value: string): Promise<void> => {
  await redisClient.sendCommand([CF.ADD, cfKey, value]);
};

export const cfExists = async (
  cfKey: string,
  value: string,
): Promise<boolean> => {
  const result = await redisClient.sendCommand([CF.EXISTS, cfKey, value]);
  return !!result;
};

export const cfDel = async (cfKey: string, value: string): Promise<void> => {
  await redisClient.sendCommand([CF.DEL, cfKey, value]);
};

export const incrementClickCount = async (shortId: string): Promise<void> => {
  await redisClient.hIncrBy("clicks", shortId, 1);
};

export const redis = redisClient;
