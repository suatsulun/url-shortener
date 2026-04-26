import { describe, it, expect } from "vitest";
import { normalizeUrl, hashUrl } from "./urlUtils.js";

describe("normalizeUrl", () => {
  it("adds https:// when scheme is missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });

  it("keeps http:// scheme when explicitly given", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("trims whitespace from input", () => {
    expect(normalizeUrl("  https://example.com  ")).toBe("https://example.com");
  });

  it("lowercases hostname but preserves path case", () => {
    expect(normalizeUrl("https://EXAMPLE.com/Path")).toBe(
      "https://example.com/Path",
    );
  });

  it("strips trailing slash", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
  });

  it("sorts query parameters alphabetically", () => {
    expect(normalizeUrl("https://example.com?b=2&a=1")).toBe(
      "https://example.com/?a=1&b=2",
    );
  });

  it("throws Error with cause on invalid URL", () => {
    expect(() => normalizeUrl("https://")).toThrowError("Invalid URL");
  });
});

describe("hashUrl", () => {
  it("returns a 64-character hex string (sha256)", () => {
    const hash = hashUrl("https://example.com");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces the same hash for the same input", () => {
    expect(hashUrl("https://example.com")).toBe(hashUrl("https://example.com"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashUrl("https://a.com")).not.toBe(hashUrl("https://b.com"));
  });
});
