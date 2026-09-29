const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export interface MinimalRequest {
  method: string;
  url: string;
  headers: Headers;
}

/**
 * Defense-in-depth CSRF check for cookie-authenticated admin mutations.
 * The session cookie is already SameSite=Lax (browsers won't attach it to a
 * genuine cross-site POST), so this only blocks requests carrying explicit
 * evidence of a cross-origin browser request; it stays permissive when no
 * Origin/Sec-Fetch-Site signal is present at all (non-browser clients).
 */
export function isBlockedCrossOriginRequest(request: MinimalRequest): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return false;
  }

  const requestOrigin = new URL(request.url).origin;

  const origin = request.headers.get("origin");
  if (origin) {
    return origin !== requestOrigin;
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite) {
    return secFetchSite !== "same-origin" && secFetchSite !== "none";
  }

  return false;
}
