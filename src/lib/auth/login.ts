import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { RateLimiter } from "@/lib/rate-limit";
import { getAdminSession, type CookieStore } from "@/lib/auth/session";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginRateLimiter = new RateLimiter(LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

export type LoginResult =
  | { success: true }
  | { success: false; reason: "invalid_credentials" }
  | { success: false; reason: "locked"; retryAfterSeconds: number };

export async function loginAdmin(params: {
  email: string;
  password: string;
  cookieStore: CookieStore;
  rateLimitKey: string;
}): Promise<LoginResult> {
  const { email, password, cookieStore, rateLimitKey } = params;

  const rateLimit = loginRateLimiter.consume(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      success: false,
      reason: "locked",
      retryAfterSeconds: rateLimit.retryAfterSeconds ?? 0,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  // Always run bcrypt.compare, even for an unknown user, so response timing
  // does not reveal whether the email exists.
  const passwordHash = user?.passwordHash ?? "$2a$12$invalidsaltinvalidsaltinvalidsaltinva";
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!user || !passwordMatches) {
    return { success: false, reason: "invalid_credentials" };
  }

  loginRateLimiter.reset(rateLimitKey);

  const session = await getAdminSession(cookieStore);
  session.adminUserId = user.id;
  session.email = user.email;
  await session.save();

  return { success: true };
}

export async function logoutAdmin(cookieStore: CookieStore): Promise<void> {
  const session = await getAdminSession(cookieStore);
  session.destroy();
}
