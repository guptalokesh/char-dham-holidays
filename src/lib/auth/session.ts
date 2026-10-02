import {
  getIronSession,
  type CookieStore,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { resolveSessionSecret } from "@/lib/auth/session-secret";

export interface AdminSessionData {
  adminUserId?: string;
  email?: string;
}

export type { CookieStore };

const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function buildSessionOptions(ttlSeconds: number): SessionOptions {
  return {
    cookieName: "chardham_admin_session",
    password: resolveSessionSecret(),
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
