import type { MetadataRoute } from "next";
import { listTreks } from "@/lib/trek";

// Trek listings are admin-editable; the sitemap must reflect new/removed
// treks without a rebuild.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/chardham",
  "/trekking",
  "/devrana-mandir",
  "/farm-home-stay",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const treks = await listTreks();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const trekEntries: MetadataRoute.Sitemap = treks.map((trek) => ({
    url: `${siteUrl}/trekking/${trek.slug}`,
    lastModified: trek.updatedAt,
  }));

  return [...staticEntries, ...trekEntries];
}
