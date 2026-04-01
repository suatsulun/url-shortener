import { createHash } from "crypto";

export const normalizeUrl = (rawUrl: string): string => {
    let input = rawUrl.trim();
    if (!/^https?:\/\//i.test(input)) {
        input = `https://${input}`;
    }
    try {
        const urlObj = new URL(input);
        urlObj.protocol = urlObj.protocol.toLowerCase();
        urlObj.hostname = urlObj.hostname.toLowerCase();
        urlObj.searchParams.sort();
        return urlObj.toString().replace(/\/$/, "");
    } catch (error) {
        throw new Error("Invalid URL");
    }
};

export const hashUrl = (normalizedUrl: string): string => {
    return createHash("sha256").update(normalizedUrl).digest("hex");    
};