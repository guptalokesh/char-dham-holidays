import { describe, expect, it } from "vitest";
import { isBlockedCrossOriginRequest } from "@/lib/csrf";

function makeRequest(
  method: string,
  url: string,
  headers: Record<string, string> = {}
) {
  return { method, url, headers: new Headers(headers) };
}

describe("isBlockedCrossOriginRequest", () => {
  it("never blocks safe methods regardless of origin", () => {
    const req = makeRequest("GET", "https://example.com/api/admin/settings", {
      origin: "https://evil.example",
    });
    expect(isBlockedCrossOriginRequest(req)).toBe(false);
  });

  it("allows a same-origin POST (Origin header matches)", () => {
    const req = makeRequest("POST", "https://example.com/api/admin/settings", {
      origin: "https://example.com",
    });
    expect(isBlockedCrossOriginRequest(req)).toBe(false);
  });

  it("blocks a cross-origin POST (Origin header mismatches)", () => {
    const req = makeRequest("POST", "https://example.com/api/admin/settings", {
      origin: "https://evil.example",
    });
    expect(isBlockedCrossOriginRequest(req)).toBe(true);
  });

  it("allows same-origin per Sec-Fetch-Site when Origin is absent", () => {
    const req = makeRequest("PATCH", "https://example.com/api/admin/settings", {
      "sec-fetch-site": "same-origin",
    });
    expect(isBlockedCrossOriginRequest(req)).toBe(false);
  });

  it("blocks cross-site per Sec-Fetch-Site when Origin is absent", () => {
    const req = makeRequest("DELETE", "https://example.com/api/admin/media/1", {
      "sec-fetch-site": "cross-site",
    });
    expect(isBlockedCrossOriginRequest(req)).toBe(true);
  });

  it("is permissive when neither signal is present (non-browser client)", () => {
    const req = makeRequest("POST", "https://example.com/api/admin/settings");
    expect(isBlockedCrossOriginRequest(req)).toBe(false);
  });
});
