import { describe, expect, it } from "vitest";
import { resolveSessionSecret } from "@/lib/auth/session-secret";

const LONG = "s".repeat(40);
const DB = "postgresql://u:pw@ep-x.neon.tech/db?sslmode=require";

describe("resolveSessionSecret", () => {
  it("uses SESSION_SECRET when it is long enough", () => {
    expect(resolveSessionSecret({ SESSION_SECRET: LONG, DATABASE_URL: DB })).toBe(LONG);
  });

  it("derives a stable 32+ character secret from the database URL when none is set", () => {
    const a = resolveSessionSecret({ DATABASE_URL: DB });
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(resolveSessionSecret({ DATABASE_URL: DB })).toBe(a);
    expect(resolveSessionSecret({ DATABASE_URL: DB + "x" })).not.toBe(a);
  });

  it("does not derive from the URL when SESSION_SECRET is set but too short", () => {
    expect(() => resolveSessionSecret({ SESSION_SECRET: "short", DATABASE_URL: DB })).toThrow(/32/);
  });

  it("throws when neither a secret nor a database URL is available", () => {
    expect(() => resolveSessionSecret({})).toThrow(/SESSION_SECRET/);
  });
});
