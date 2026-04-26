import { redis } from "./redis.js";
import { logger } from "./logger.js";

export const getOrSetCache = async (
  key: string,
  fetchFunction: () => Promise<string>,
  ttlSeconds = 1800,
): Promise<string> => {
  try {
    const cachedValue = await redis.get(key);
    if (cachedValue) {
      return cachedValue;
    }
    logger.debug({ key }, "Cache miss");
    const freshValue = await fetchFunction();
    await redis.setEx(key, ttlSeconds, freshValue);
    return freshValue;
  } catch (err) {
    logger.error({ err, key }, "Cache error");
    return await fetchFunction();
  }
};
