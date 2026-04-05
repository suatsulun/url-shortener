import { db } from '../db/index.js';
import { urls } from '../db/schema/urls.js';
import { eq, desc, and } from 'drizzle-orm';
import { userUrls } from '../db/schema/userUrls.js';
import { redis, cfAdd, cfExists, cfDel, CF_KEYS } from '../lib/redis.js';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

const generateShortId = ():string => nanoid(6);

export const findUrlByHash = async (hash: string) => {
    const url = await db.select().from(urls).where(eq(urls.urlHash, hash));
    return url[0] || null;
};

export const findUrlByShortId = async (shortId: string) => {
  const url = await db.select().from(urls).where(eq(urls.shortId, shortId));
  return url[0] || null;
};

export const findUrlsByUserId = async (userId: number) => {
    const allUrls = await db
  .select()
  .from(userUrls)
  .innerJoin(urls, eq(userUrls.urlId, urls.id))
  .where(eq(userUrls.userId, userId))
  .orderBy(desc(userUrls.createdAt));
    return allUrls;
}


export const createUrl = async (userId: number, urlHash: string, originalUrl: string) => {
    try {
    const hashExistsInFilter = await cfExists(CF_KEYS.URL_HASHES, urlHash);
        if (hashExistsInFilter) {
            const existingUrl = await findUrlByHash(urlHash);
            if (existingUrl) {
                await db.insert(userUrls).values({
                    userId,
                    urlId: existingUrl.id,
                }).onConflictDoNothing();
                return existingUrl.shortId;
    }}
    
     return await db.transaction(async (tx) => {
        let shortId: string;
        try {
            const pooledId = await redis.lPop("shortIdPool");
            shortId = pooledId || generateShortId();
            } catch (error) {
                console.warn("Redis Pool empty, back to nanoid generation");
                shortId = generateShortId();
            }
        
        const [newUrl] = await tx.insert(urls).values({
            originalUrl,
            urlHash,
            shortId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }).returning();
        await tx.insert(userUrls).values({
            userId,
            urlId: newUrl.id,
        });
        try {
            await cfAdd(CF_KEYS.SHORT_IDS, newUrl.shortId);
            await cfAdd(CF_KEYS.URL_HASHES, newUrl.urlHash);
        } catch (error) {
            console.error("Error adding to Redis Cuckoo Filter:", error);
        }
        return newUrl.shortId;
    });
    } catch (error) {
        console.error("Error creating URL:", error);
        throw new Error("Failed to create short URL");}
    };

export const incrementClicks = async (shortId: string) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  await db
    .update(urls)
    .set({ clicks: sql`${urls.clicks} + 1`,
           lastAccessedAt: new Date(),
           expiresAt: thirtyDaysFromNow })
    .where(eq(urls.shortId, shortId));
};

export const bulkUpdateClicks = async (clicks: Record<string, number>): Promise<void> => {
    const entries = Object.entries(clicks);
    if (entries.length === 0) return;

    await Promise.all(
        entries.map(([shortId, count]) => {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            return db
                .update(urls)
                .set({
                    clicks: sql`${urls.clicks} + ${count}`,
                    lastAccessedAt: new Date(),
                    expiresAt: thirtyDaysFromNow,
                })
                .where(eq(urls.shortId, shortId));
        })
    );
};

export const removeUrlOwnership = async (userId: number, urlId: number) => {
    try {
        await db.transaction(async (tx) => {
            await tx.delete(userUrls).where(and(eq(userUrls.userId, userId), eq(userUrls.urlId, urlId)));
            const remainingOwners = await tx.select().from(userUrls).where(eq(userUrls.urlId, urlId));

            if (remainingOwners.length === 0) {
                const [deletedUrl] = await tx.delete(urls)
                    .where(eq(urls.id, urlId))
                    .returning();

                if (deletedUrl) {
                    try {
                    await cfDel(CF_KEYS.SHORT_IDS, deletedUrl.shortId);
                    await cfDel(CF_KEYS.URL_HASHES, deletedUrl.urlHash);
                    await redis.rPush("shortIdPool", deletedUrl.shortId)
                    } catch (redisError) {
                        console.error("Cleanup Redis failed after URL deletion:", redisError);
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error removing URL ownership:", error);
        throw new Error("Could not remove URL. Please try again.");
    }
};

export const cleanupExpiredUrls = async (): Promise<number> => {
    let totalCleaned = 0;
    while (true) {
        const expiredUrls = await db
            .select()
            .from(urls)
            .where(sql`${urls.expiresAt} < NOW()`)
            .limit(100);
        if (expiredUrls.length === 0) {
            break;
        }

        for (const url of expiredUrls) {
            try {
                await db.transaction(async (tx) => {
                    await tx.delete(userUrls).where(eq(userUrls.urlId, url.id));
                    await tx.delete(urls).where(eq(urls.id, url.id));
                });

                await cfDel(CF_KEYS.SHORT_IDS, url.shortId);
                await cfDel(CF_KEYS.URL_HASHES, url.urlHash);
                await redis.del(url.shortId)
                await redis.rPush("shortIdPool", url.shortId);
                totalCleaned++;
            } catch (error) {
                console.error("Error cleaning up expired URL ${url.shortId}:", error);
            }
        }
        if (expiredUrls.length < 100) {
            break;
        }
    }
    return totalCleaned;
};
        
