import { describe, expect, it } from "vitest";
import { formatInr, formatPriceOrRequest } from "@/lib/format";

describe("formatPriceOrRequest", () => {
  it("formats a price in rupees", () => {
    expect(formatPriceOrRequest(21000)).toBe(formatInr(21000));
    expect(formatPriceOrRequest(21000)).toContain("21,000");
  });

  it("says price on request when there is no price", () => {
    expect(formatPriceOrRequest(null)).toBe("Price on request");
  });
});
