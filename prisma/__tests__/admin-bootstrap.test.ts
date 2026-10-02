// @vitest-environment node
import { describe, expect, it } from "vitest";
import { resolveAdminCredentials } from "../admin-bootstrap";

describe("resolveAdminCredentials", () => {
  it("uses ADMIN_EMAIL and ADMIN_PASSWORD when provided", () => {
    expect(resolveAdminCredentials({ ADMIN_EMAIL: "a@b.co", ADMIN_PASSWORD: "pw-123456789" })).toEqual({
      email: "a@b.co",
      password: "pw-123456789",
      generated: false,
    });
  });

  it("falls back to the dev-only login on a developer machine", () => {
    const creds = resolveAdminCredentials({});
    expect(creds.password).toBe("ChangeMe123!");
    expect(creds.generated).toBe(false);
  });

  it("generates a random strong password on a hosted build when none is set", () => {
    for (const env of [{ VERCEL: "1" }, { NETLIFY: "true" }, { CI: "true" }]) {
      const a = resolveAdminCredentials(env);
      const b = resolveAdminCredentials(env);
      expect(a.generated).toBe(true);
      expect(a.password).toHaveLength(20);
      expect(a.password).not.toBe(b.password);
      expect(a.email).toBe("Sanjaythapliyal02@gmail.com");
    }
  });
});
