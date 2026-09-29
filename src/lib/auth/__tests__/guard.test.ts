import { describe, expect, it } from "vitest";
import { requireAdminSession } from "@/lib/auth/guard";
import { getAdminSession } from "@/lib/auth/session";
import { createMemoryCookieStore } from "./memory-cookie-store";

describe("requireAdminSession", () => {
  it("returns null when there is no session", async () => {
    const store = createMemoryCookieStore();
    expect(await requireAdminSession(store)).toBeNull();
  });

  it("returns the authenticated admin when a session exists", async () => {
    const store = createMemoryCookieStore();
    const session = await getAdminSession(store);
    session.adminUserId = "admin-1";
    session.email = "admin@example.com";
    await session.save();

    expect(await requireAdminSession(store)).toEqual({
      adminUserId: "admin-1",
      email: "admin@example.com",
    });
  });

  it("returns null after the session has been destroyed", async () => {
    const store = createMemoryCookieStore();
    const session = await getAdminSession(store);
    session.adminUserId = "admin-1";
    session.email = "admin@example.com";
    await session.save();
    session.destroy();

    expect(await requireAdminSession(store)).toBeNull();
  });
});
