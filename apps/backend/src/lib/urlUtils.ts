import { createHash } from "crypto";

export const normalizeUrl = (rawUrl: string): string => {
    try {
        const normalizedUrl = new URL(rawUrl);
        normalizedUrl.protocol = normalizedUrl.protocol.toLowerCase();
        normalizedUrl.hostname = normalizedUrl.hostname.toLowerCase();
        return normalizedUrl.toString();
    } catch (error) {
        throw new Error("Invalid URL");
    }
};

export const hashUrl = (normalizedUrl: string): string => {
    return createHash("sha256").update(normalizedUrl).digest("hex");    
};