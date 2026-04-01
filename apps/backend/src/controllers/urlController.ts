import { Request, Response } from 'express';
import { normalizeUrl, hashUrl } from '../lib/urlUtils.js';
import { createUrl, findUrlByShortId, incrementClicks } from '../services/urlService.js';
import { cfExists } from '../lib/redis.js';
import { z } from 'zod';

const paramsSchema = z.object({
    shortId: z.string().min(1).max(7)
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

        const urlEntry = await findUrlByShortId(shortId);
        if (!urlEntry) {
            return res.status(404).json({ error: "URL not found" });
        }

        incrementClicks(urlEntry.id).catch(err => 
            console.error("Click tracking failed:", err)
        );

        return res.redirect(urlEntry.originalUrl);
    } catch (error) {
        console.error("Redirect error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};