import { redis } from "./redis.js";


export const getOrSetCache = async (key: string, fetchFunction: () => Promise<string>, ttlSeconds = 1800): Promise<string> => {
    try {
        const cachedValue = await redis.get(key);
        if (cachedValue) {
    console.log("CACHE HIT:", key);
    return cachedValue;
}
console.log("CACHE MISS:", key);
        const freshValue = await fetchFunction();
        await redis.setEx(key, ttlSeconds, freshValue);
        return freshValue;
    } catch (error) {
        console.error("Cache error:", error);
        return await fetchFunction();
    }
};