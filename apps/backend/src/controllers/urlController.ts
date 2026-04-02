import { Request, Response } from 'express';
import { normalizeUrl, hashUrl } from '../lib/urlUtils.js';
import { createUrl, findUrlByHash, findUrlByShortId, incrementClicks } from '../services/urlService.js';
import { cfExists } from '../lib/redis.js';
import { z } from 'zod';
import { getOrSetCache } from '../lib/cache.js';
import { url } from 'inspector';

const paramsSchema = z.object({
    shortId: z.string().min(1).max(6)
});

export const shortenUrl = async (req: Request, res: Response) => {
    try {
        const { originalUrl } = req.body;
        const userId = req.userId as number;

        if (!originalUrl) {
            return res.status(400).json({ error: "URL is required" });
        }

        const normalized = normalizeUrl(originalUrl);
        const urlHash = hashUrl(normalized);

        const shortId = await createUrl(userId, urlHash, normalized);

        return res.status(201).json({
            shortId,
            shortUrl: `${process.env.FRONTEND_URL}/${shortId}`,
            originalUrl: normalized
        });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const redirectUrl = async (req: Request, res: Response) => {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({ error: "Invalid parameters" });
    }
    const { shortId } = result.data;
    try {
        const existsInFilter = await cfExists(shortId);
        if (!existsInFilter) {
            return res.status(404).json({ error: "URL not found" });
        }
        const urlEntry = await getOrSetCache(shortId, async () => {
            const url = await findUrlByShortId(shortId);
            if (!url) {
                throw new Error("URL not found");
            }
            return url.originalUrl;
        });

        return res.redirect(urlEntry); 
        
    } catch (error) {
        console.error("Redirect error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};