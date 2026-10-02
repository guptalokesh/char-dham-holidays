import { describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://a.example", URL: "https://b.netlify.app" })).toBe(
      "https://a.example"
    );
  });

  it("falls back to the URL Netlify provides at build time", () => {
    expect(getSiteUrl({ URL: "https://b.netlify.app" })).toBe("https://b.netlify.app");
  });

  it("falls back to localhost for local development", () => {
    expect(getSiteUrl({})).toBe("http://localhost:3000");
  });

  it("uses the Vercel production domain when present", () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "char-dham.vercel.app" })).toBe(
      "https://char-dham.vercel.app"
    );
  });
});
