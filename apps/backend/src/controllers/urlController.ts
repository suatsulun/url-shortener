import { Request, Response } from "express";
import { normalizeUrl, hashUrl } from "../lib/urlUtils.js";
import {
  createUrl,
  findUrlByShortId,
  findUrlsByUserId,
  removeUrlOwnership,
  urlOwnershipCheck,
} from "../services/urlService.js";
import { cfExists, CF_KEYS } from "../lib/redis.js";
import { z } from "zod";
import { getOrSetCache } from "../lib/cache.js";
import { incrementClickCount } from "../lib/redis.js";
import { cleanupExpiredUrls } from "../services/urlService.js";

const paramsSchema = z.object({
  shortId: z.string().min(1).max(6).regex(/^[A-Za-z0-9_-]+$/),
});

export const shortenUrl = async (req: Request, res: Response) => {
  try {
    const { originalUrl } = req.body;
    const userId = req.userId as number;

    if (!originalUrl) {
      return res.status(404).json({ error: "URL not found" });
    }

    const normalized = normalizeUrl(originalUrl);
    const urlHash = hashUrl(normalized);

    const shortId = await createUrl(userId, urlHash, normalized);

    return res.status(201).json({
      shortId,
      shortUrl: `${process.env.FRONTEND_URL}/${shortId}`,
      originalUrl: normalized,
    });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
};

export const getUserUrls = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as number;
    const urls = await findUrlsByUserId(userId);
    return res.status(200).json(urls);
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const redirectUrl = async (req: Request, res: Response) => {
  const result = paramsSchema.safeParse(req.params);

  if (!result.success) {
    return res.redirect("/not-found");
  }
  const { shortId } = result.data;
  try {
    const existsInFilter = await cfExists(CF_KEYS.SHORT_IDS, shortId);
    if (!existsInFilter) {
      return res.redirect("/not-found");
    }
    const urlEntry = await getOrSetCache(shortId, async () => {
      const url = await findUrlByShortId(shortId);
      if (!url) {
        throw new Error("URL not found");
      }
      return url.originalUrl;
    });
    res.redirect(urlEntry);
    incrementClickCount(shortId).catch((err) =>
      console.error("Failed to increment click count:", err),
    );
  } catch (error: any) {
    if (error?.message === "URL not found") {
      return res.redirect("/not-found");
    }
    console.error("Redirect error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as number;
    const { shortId } = req.params as { shortId: string };
    const url = await findUrlByShortId(shortId);
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }
    const userUrls = await urlOwnershipCheck(userId, url.id);
    if (!userUrls) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this URL" });
    }
    await removeUrlOwnership(userId, url.id);
    return res.status(204).send();
  } catch (error) {
    console.error("Deletion error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const triggerCleanup = async (req: Request, res: Response) => {
  try {
    const totalCleaned = await cleanupExpiredUrls();
    return res
      .status(200)
      .json({ message: `Cleanup complete. ${totalCleaned} URLs cleaned.` });
  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
