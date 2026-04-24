import { z } from "zod";

export const shortenUrlSchema = z.object({
  originalUrl: z.url(),
});

export const shortIdParamSchema = z.object({
  shortId: z
    .string()
    .min(1)
    .max(6)
    .regex(/^[A-Za-z0-9_-]+$/),
});
