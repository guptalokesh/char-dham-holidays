export function activeHref(pathname: string | null, hrefs: string[]): string | null {
  if (!pathname) return null;
  const matches = hrefs.filter(
    (href) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
  );
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}
