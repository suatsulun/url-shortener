import { db } from '../db/index.js';
import { urls } from '../db/schema/urls.js';
import { eq, desc } from 'drizzle-orm';
import { userUrls } from '../db/schema/userUrls.js';

const generateShortId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortId = "";
    for (let i = 0; i < 6; i++) {
        shortId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shortId;
};

export const findUrlByHash = async (hash: string) => {
    const url = await db.select().from(urls).where(eq(urls.urlHash, hash));
    return url[0] || null;
};

export const findUrlsByUserId = async (userId: string) => {
    const allUrls = await db.select().from(userUrls).where(eq(userUrls.userId, userId)).orderBy(desc(userUrls.createdAt));
    return allUrls;
}


export const createUrl = async (userId: string, urlHash: string, originalUrl: string) => {

    if (await findUrlByHash(urlHash)) {
        throw new Error("Url already exists");
    }

    const shortId = generateShortId();
    
    const newUrl = await db.insert(urls).values({
        shortId,
        urlHash,
        originalUrl,
    }).returning();
    await db.insert(userUrls).values({
        userId,
        urlId: newUrl[0].id,
    });
    return newUrl[0];
};


