import { describe, expect, it } from "vitest";
import { addDays, formatDateOnly, getNightsBetween, parseDateOnly } from "@/lib/date-utils";

describe("parseDateOnly", () => {
  it("interprets the string as UTC midnight regardless of local timezone", () => {
    const date = parseDateOnly("2026-10-20");
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(9); // 0-indexed
    expect(date.getUTCDate()).toBe(20);
    expect(date.getUTCHours()).toBe(0);
  });

  it("round-trips through formatDateOnly", () => {
    expect(formatDateOnly(parseDateOnly("2026-01-05"))).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("adds whole days without drifting across a month boundary", () => {
    const result = addDays(parseDateOnly("2026-01-30"), 3);
    expect(formatDateOnly(result)).toBe("2026-02-02");
  });
});

describe("getNightsBetween", () => {
  it("includes check-in, excludes check-out (nights, not calendar days)", () => {
    const nights = getNightsBetween("2026-10-20", "2026-10-23");
    expect(nights.map(formatDateOnly)).toEqual([
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
    ]);
  });

  it("returns a single night for a one-night stay", () => {
    const nights = getNightsBetween("2026-10-20", "2026-10-21");
    expect(nights.map(formatDateOnly)).toEqual(["2026-10-20"]);
  });

  it("returns an empty array when check-out is not after check-in", () => {
    expect(getNightsBetween("2026-10-20", "2026-10-20")).toEqual([]);
  });
});
