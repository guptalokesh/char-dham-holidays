import type { MetadataRoute } from "next";
import { listTreks } from "@/lib/trek";
import { listPackages } from "@/lib/packages";
import { getSiteUrl } from "@/lib/site-url";

// Trek listings are admin-editable; the sitemap must reflect new/removed
// treks without a rebuild.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/yatra",
  "/trekking",
  "/devrana-mandir",
  "/farm-home-stay",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [treks, yatras] = await Promise.all([listTreks(), listPackages()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const trekEntries: MetadataRoute.Sitemap = treks.map((trek) => ({
    url: `${siteUrl}/trekking/${trek.slug}`,
    lastModified: trek.updatedAt,
  }));

  const yatraEntries: MetadataRoute.Sitemap = yatras.map((yatra) => ({
    url: `${siteUrl}/yatra/${yatra.slug}`,
    lastModified: yatra.updatedAt,
  }));

  return [...staticEntries, ...yatraEntries, ...trekEntries];
}
