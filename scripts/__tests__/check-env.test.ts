// @vitest-environment node
import { describe, expect, it } from "vitest";
import { findEnvProblems } from "../check-env";

const good = {
  DATABASE_URL: "postgresql://u:p@ep-x.neon.tech/db?sslmode=require",
  SESSION_SECRET: "a".repeat(32),
  ADMIN_PASSWORD: "a-strong-password-1",
};

describe("findEnvProblems", () => {
  it("accepts a complete, safe configuration", () => {
    expect(findEnvProblems(good)).toEqual([]);
  });

  it("only requires a database URL — secret and admin password are optional", () => {
    expect(findEnvProblems({ DATABASE_URL: good.DATABASE_URL })).toEqual([]);
    expect(findEnvProblems({ DATABASE_URL_UNPOOLED: good.DATABASE_URL })).toEqual([]);
    expect(findEnvProblems({}).join(" ")).toMatch(/DATABASE_URL/);
  });

  it("rejects a session secret that is set but shorter than 32 characters", () => {
    expect(findEnvProblems({ ...good, SESSION_SECRET: "short" }).join(" ")).toMatch(/SESSION_SECRET/);
  });

  it("rejects the well-known default and placeholder admin passwords", () => {
    for (const ADMIN_PASSWORD of ["ChangeMe123!", "replace-with-a-strong-password"]) {
      expect(findEnvProblems({ ...good, ADMIN_PASSWORD }).join(" ")).toMatch(/ADMIN_PASSWORD/);
    }
  });

  it("rejects a localhost database URL", () => {
    const url = "postgresql://u:p@localhost:5432/db";
    expect(findEnvProblems({ ...good, DATABASE_URL: url }).join(" ")).toMatch(/DATABASE_URL/);
  });
});
