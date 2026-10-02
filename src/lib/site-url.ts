export function getSiteUrl(env: Record<string, string | undefined> = process.env): string {
  return env.NEXT_PUBLIC_SITE_URL || env.URL || "http://localhost:3000";
}
