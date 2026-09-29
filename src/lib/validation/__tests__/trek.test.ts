import { describe, expect, it } from "vitest";
import {
  trekCreateSchema,
  trekRequestSchema,
  trekUpdateSchema,
} from "@/lib/validation/trek";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("trekCreateSchema", () => {
  it("accepts a valid trek without an explicit slug", () => {
    const result = trekCreateSchema.safeParse({
      name: "Devrana Trek",
      description: "A customised trekking experience.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug format", () => {
    const result = trekCreateSchema.safeParse({
      name: "Devrana Trek",
      slug: "Not A Valid Slug!",
      description: "desc",
    });
    expect(result.success).toBe(false);
  });
});

describe("trekUpdateSchema", () => {
  it("accepts clearing the price back to null", () => {
    const result = trekUpdateSchema.safeParse({ price: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBeNull();
  });

  it("rejects a non-positive price", () => {
    expect(trekUpdateSchema.safeParse({ price: 0 }).success).toBe(false);
  });
});

describe("trekRequestSchema", () => {
  const valid = {
    name: "Kunal Mehta",
    phone: "+91 98765 43210",
    people: 3,
    preferredDate: futureDate(20),
    requirements: "Need vegetarian meals",
  };

  it("accepts a valid request without requirements", () => {
    const { requirements: _requirements, ...rest } = valid;
    expect(trekRequestSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects a past preferred date", () => {
    expect(
      trekRequestSchema.safeParse({ ...valid, preferredDate: futureDate(-1) }).success
    ).toBe(false);
  });

  it("rejects zero people", () => {
    expect(trekRequestSchema.safeParse({ ...valid, people: 0 }).success).toBe(false);
  });

  it("rejects an unreasonably large group", () => {
    expect(trekRequestSchema.safeParse({ ...valid, people: 200 }).success).toBe(false);
  });
});
