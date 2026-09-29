import { describe, expect, it } from "vitest";
import {
  chardhamAvailabilityRequestSchema,
  chardhamPackageUpdateSchema,
} from "@/lib/validation/chardham";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("chardhamAvailabilityRequestSchema", () => {
  const valid = {
    name: "Rahul Verma",
    phone: "+91 98765 43210",
    preferredDate: futureDate(10),
    travellers: 4,
  };

  it("accepts a valid request", () => {
    expect(chardhamAvailabilityRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts today's date", () => {
    const result = chardhamAvailabilityRequestSchema.safeParse({
      ...valid,
      preferredDate: futureDate(0),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a past date", () => {
    const result = chardhamAvailabilityRequestSchema.safeParse({
      ...valid,
      preferredDate: futureDate(-1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date string", () => {
    const result = chardhamAvailabilityRequestSchema.safeParse({
      ...valid,
      preferredDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative travellers", () => {
    expect(
      chardhamAvailabilityRequestSchema.safeParse({ ...valid, travellers: 0 }).success
    ).toBe(false);
  });

  it("rejects an unreasonably large traveller count", () => {
    expect(
      chardhamAvailabilityRequestSchema.safeParse({ ...valid, travellers: 500 }).success
    ).toBe(false);
  });

  it("rejects a missing name or malformed phone", () => {
    expect(
      chardhamAvailabilityRequestSchema.safeParse({ ...valid, name: "" }).success
    ).toBe(false);
    expect(
      chardhamAvailabilityRequestSchema.safeParse({ ...valid, phone: "abc" }).success
    ).toBe(false);
  });
});

describe("chardhamPackageUpdateSchema", () => {
  it("accepts a valid partial update", () => {
    const result = chardhamPackageUpdateSchema.safeParse({
      price: 210000,
      destinations: ["Yamunotri", "Gangotri", "Sri Kedarnath", "Badrinath"],
      active: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive price", () => {
    expect(chardhamPackageUpdateSchema.safeParse({ price: 0 }).success).toBe(false);
    expect(chardhamPackageUpdateSchema.safeParse({ price: -100 }).success).toBe(false);
  });

  it("rejects an empty destinations array", () => {
    expect(
      chardhamPackageUpdateSchema.safeParse({ destinations: [] }).success
    ).toBe(false);
  });

  it("treats an empty string as clearing an optional field", () => {
    const result = chardhamPackageUpdateSchema.safeParse({ importantInfo: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.importantInfo).toBeNull();
    }
  });
});
