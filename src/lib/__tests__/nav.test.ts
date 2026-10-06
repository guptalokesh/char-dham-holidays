import { describe, expect, it } from "vitest";
import { activeHref } from "@/lib/nav";

const hrefs = ["/", "/yatra", "/yatra/yamunotri-gangotri-handling", "/trekking", "/contact"];

describe("activeHref", () => {
  it("matches the page itself", () => {
    expect(activeHref("/trekking", hrefs)).toBe("/trekking");
    expect(activeHref("/", hrefs)).toBe("/");
  });

  it("matches a child page to its section", () => {
    expect(activeHref("/trekking/devrana-trek", hrefs)).toBe("/trekking");
    expect(activeHref("/yatra/char-dham", hrefs)).toBe("/yatra");
  });

  it("prefers the most specific link", () => {
    expect(activeHref("/yatra/yamunotri-gangotri-handling", hrefs)).toBe(
      "/yatra/yamunotri-gangotri-handling"
    );
  });

  it("does not treat Home as the parent of every page, and returns null for unknown pages", () => {
    expect(activeHref("/privacy-policy", hrefs)).toBeNull();
    expect(activeHref(null, hrefs)).toBeNull();
  });
});
