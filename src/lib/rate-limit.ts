interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number
  ) {}

  consume(key: string, now: number = Date.now()): RateLimitResult {
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }

    if (bucket.count >= this.max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }

    bucket.count += 1;
    return { allowed: true };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}
