import bcrypt from "bcryptjs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { loginAdmin, logoutAdmin } from "@/lib/auth/login";
import { getAdminSession } from "@/lib/auth/session";
import { createMemoryCookieStore } from "./memory-cookie-store";

const EMAIL = "admin@test.example";
const PASSWORD = "correct-horse-battery-staple";

describe("loginAdmin / logoutAdmin", () => {
  beforeEach(async () => {
    await prisma.adminUser.deleteMany();
    await prisma.adminUser.create({
      data: {
        email: EMAIL,
        passwordHash: await bcrypt.hash(PASSWORD, 12),
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("succeeds with correct credentials and sets the session", async () => {
    const store = createMemoryCookieStore();

    const result = await loginAdmin({
      email: EMAIL,
      password: PASSWORD,
      cookieStore: store,
      rateLimitKey: "test-ip-1",
    });

    expect(result).toEqual({ success: true });

    const session = await getAdminSession(store);
    expect(session.email).toBe(EMAIL);
    expect(session.adminUserId).toBeDefined();
  });

  it("fails with a wrong password and does not set a session", async () => {
    const store = createMemoryCookieStore();

    const result = await loginAdmin({
      email: EMAIL,
      password: "wrong-password",
      cookieStore: store,
      rateLimitKey: "test-ip-2",
    });

    expect(result).toEqual({ success: false, reason: "invalid_credentials" });

    const session = await getAdminSession(store);
    expect(session.adminUserId).toBeUndefined();
  });

  it("fails with an unknown email using the same generic reason", async () => {
    const store = createMemoryCookieStore();

    const result = await loginAdmin({
      email: "nobody@test.example",
      password: PASSWORD,
      cookieStore: store,
      rateLimitKey: "test-ip-3",
    });

    expect(result).toEqual({ success: false, reason: "invalid_credentials" });
  });

  it("locks out after repeated failed attempts from the same key", async () => {
    const store = createMemoryCookieStore();
    const rateLimitKey = "test-ip-lockout";

    for (let i = 0; i < 5; i++) {
      await loginAdmin({
        email: EMAIL,
        password: "wrong-password",
        cookieStore: store,
        rateLimitKey,
      });
    }

    const result = await loginAdmin({
      email: EMAIL,
      password: PASSWORD,
      cookieStore: store,
      rateLimitKey,
    });

    expect(result.success).toBe(false);
    expect(result).toMatchObject({ reason: "locked" });
  });

  it("resets the lockout counter after a successful login", async () => {
    const store = createMemoryCookieStore();
    const rateLimitKey = "test-ip-reset";

    for (let i = 0; i < 4; i++) {
      await loginAdmin({
        email: EMAIL,
        password: "wrong-password",
        cookieStore: store,
        rateLimitKey,
      });
    }

    const success = await loginAdmin({
      email: EMAIL,
      password: PASSWORD,
      cookieStore: store,
      rateLimitKey,
    });
    expect(success).toEqual({ success: true });

    const next = await loginAdmin({
      email: EMAIL,
      password: "wrong-password",
      cookieStore: store,
      rateLimitKey,
    });
    expect(next).toEqual({ success: false, reason: "invalid_credentials" });
  });

  it("logoutAdmin clears an active session", async () => {
    const store = createMemoryCookieStore();

    await loginAdmin({
      email: EMAIL,
      password: PASSWORD,
      cookieStore: store,
      rateLimitKey: "test-ip-logout",
    });
    await logoutAdmin(store);

    const session = await getAdminSession(store);
    expect(session.adminUserId).toBeUndefined();
  });
});
