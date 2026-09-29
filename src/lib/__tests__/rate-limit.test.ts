import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  it("allows up to max attempts within the window", () => {
    const limiter = new RateLimiter(3, 60_000);
    const now = 1_000_000;

    expect(limiter.consume("key", now).allowed).toBe(true);
    expect(limiter.consume("key", now).allowed).toBe(true);
    expect(limiter.consume("key", now).allowed).toBe(true);
  });

  it("blocks the attempt after max is exceeded, with a retry hint", () => {
    const limiter = new RateLimiter(2, 60_000);
    const now = 1_000_000;

    limiter.consume("key", now);
    limiter.consume("key", now);
    const blocked = limiter.consume("key", now + 1000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the count once the window has elapsed", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;

    limiter.consume("key", now);
    expect(limiter.consume("key", now + 1000).allowed).toBe(false);
    expect(limiter.consume("key", now + 60_001).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;

    expect(limiter.consume("a", now).allowed).toBe(true);
    expect(limiter.consume("b", now).allowed).toBe(true);
    expect(limiter.consume("a", now).allowed).toBe(false);
  });

  it("reset() clears a key immediately", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;

    limiter.consume("key", now);
    limiter.reset("key");
    expect(limiter.consume("key", now).allowed).toBe(true);
  });
});
