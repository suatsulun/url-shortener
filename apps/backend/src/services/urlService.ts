import { db } from '../db/index.js';
import { urls } from '../db/schema/urls.js';
import { eq, desc, and } from 'drizzle-orm';
import { userUrls } from '../db/schema/userUrls.js';
import {redis, cfAdd, cfExists, cfDel} from '../lib/redis.js';
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
    const existingUrl = await findUrlByHash(urlHash);
    if (existingUrl) {
        await db.insert(userUrls).values({
            userId,
            urlId: existingUrl.id,
        }).onConflictDoNothing();
        return existingUrl.shortId;
    }
    
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
        }).returning();
        await tx.insert(userUrls).values({
            userId,
            urlId: newUrl.id,
        });
        try {
        await cfAdd(newUrl.shortId);
        await cfAdd(newUrl.urlHash);}
        catch (error) {
            console.error("Error adding to Redis Cuckoo Filter:", error);
        }
        return newUrl.shortId;
    });
    } catch (error) {
        console.error("Error creating URL:", error);
        throw new Error("Failed to create short URL");}
    };

export const incrementClicks = async (urlId: number) => {
  await db
    .update(urls)
    .set({ clicks: sql`${urls.clicks} + 1` })
    .where(eq(urls.id, urlId));
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
                        await cfDel(deletedUrl.shortId),
                        await cfDel(deletedUrl.urlHash),
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

