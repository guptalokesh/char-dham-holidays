import {
  getIronSession,
  type CookieStore,
  type IronSession,
  type SessionOptions,
} from "iron-session";

export interface AdminSessionData {
  adminUserId?: string;
  email?: string;
}

export type { CookieStore };

const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a string of at least 32 characters"
    );
  }
  return secret;
}

function buildSessionOptions(ttlSeconds: number): SessionOptions {
  return {
    cookieName: "chardham_admin_session",
    password: requireSessionSecret(),
    ttl: ttlSeconds,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export async function getAdminSession(
  cookieStore: CookieStore,
  options?: { ttlSeconds?: number }
): Promise<IronSession<AdminSessionData>> {
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  return getIronSession<AdminSessionData>(cookieStore, buildSessionOptions(ttlSeconds));
}
