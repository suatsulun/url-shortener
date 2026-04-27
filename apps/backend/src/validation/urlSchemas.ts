import { z } from "zod";

export const shortenUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1)
    .max(2048)
    .regex(
      /^(https?:\/\/)?[^\s]+\.[^\s]+$/,
      "Enter a valid URL like example.com",
    ),
});

export const shortIdParamSchema = z.object({
  shortId: z
    .string()
    .min(1)
    .max(6)
    .regex(/^[A-Za-z0-9_-]+$/),
});
