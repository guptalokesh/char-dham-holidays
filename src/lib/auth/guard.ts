import { getAdminSession, type CookieStore } from "@/lib/auth/session";

export interface AuthenticatedAdmin {
  adminUserId: string;
  email: string;
}

export async function requireAdminSession(
  cookieStore: CookieStore
): Promise<AuthenticatedAdmin | null> {
  const session = await getAdminSession(cookieStore);
  if (!session.adminUserId || !session.email) {
    return null;
  }
  return { adminUserId: session.adminUserId, email: session.email };
}
