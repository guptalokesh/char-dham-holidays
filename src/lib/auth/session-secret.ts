import { createHmac } from "node:crypto";

export function resolveSessionSecret(
  env: Record<string, string | undefined> = process.env
): string {
  if (env.SESSION_SECRET) {
    if (env.SESSION_SECRET.length < 32) {
      throw new Error("SESSION_SECRET must be at least 32 characters");
    }
    return env.SESSION_SECRET;
  }

  // Zero-config hosting: the database URL contains a private password, so a
  // keyed hash of it is a stable, unguessable secret without extra setup.
  const databaseUrl = env.DATABASE_URL;
  if (databaseUrl) {
    return createHmac("sha256", "chardham-session-v1").update(databaseUrl).digest("hex");
  }

  throw new Error("SESSION_SECRET must be set (at least 32 characters)");
}
