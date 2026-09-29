import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminSession } from "@/lib/auth/session";
import { createMemoryCookieStore } from "./memory-cookie-store";

describe("admin session", () => {
  it("starts empty when no cookie exists", async () => {
    const store = createMemoryCookieStore();
    const session = await getAdminSession(store);
    expect(session.adminUserId).toBeUndefined();
  });

  it("persists adminUserId across a save/reload cycle", async () => {
    const store = createMemoryCookieStore();

    const session = await getAdminSession(store);
    session.adminUserId = "admin-1";
    session.email = "admin@example.com";
    await session.save();

    const reloaded = await getAdminSession(store);
    expect(reloaded.adminUserId).toBe("admin-1");
    expect(reloaded.email).toBe("admin@example.com");
  });

  it("clears the session on destroy()", async () => {
    const store = createMemoryCookieStore();

    const session = await getAdminSession(store);
    session.adminUserId = "admin-1";
    await session.save();
    session.destroy();

    const reloaded = await getAdminSession(store);
    expect(reloaded.adminUserId).toBeUndefined();
  });

  it("expires the session after its ttl (plus clock-skew tolerance) elapses", async () => {
    vi.useFakeTimers();
    try {
      const store = createMemoryCookieStore();
      const ttlSeconds = 5;

      const session = await getAdminSession(store, { ttlSeconds });
      session.adminUserId = "admin-1";
      await session.save();

      // iron-session's underlying seal tolerates 60s of clock skew beyond ttl.
      vi.advanceTimersByTime((ttlSeconds + 61) * 1000);

      const reloaded = await getAdminSession(store, { ttlSeconds });
      expect(reloaded.adminUserId).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
