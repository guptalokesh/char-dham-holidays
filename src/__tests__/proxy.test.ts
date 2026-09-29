import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "../proxy";

describe("proxy", () => {
  it("allows a same-origin admin mutation", async () => {
    const request = new NextRequest("https://example.com/api/admin/settings", {
      method: "PATCH",
      headers: { origin: "https://example.com" },
    });
    const response = await proxy(request);
    expect(response.status).toBe(200);
  });

  it("blocks a cross-origin admin mutation", async () => {
    const request = new NextRequest("https://example.com/api/admin/settings", {
      method: "PATCH",
      headers: { origin: "https://evil.example" },
    });
    const response = await proxy(request);
    expect(response.status).toBe(403);
  });

  it("allows a cross-origin GET (safe method)", async () => {
    const request = new NextRequest("https://example.com/api/admin/settings", {
      method: "GET",
      headers: { origin: "https://evil.example" },
    });
    const response = await proxy(request);
    expect(response.status).toBe(200);
  });
});
