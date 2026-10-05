import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPackageBySlug, parseSteps } from "@/lib/packages";
import { YatraPageContent } from "@/components/yatra/YatraPageContent";

// Admin-editable content must always reflect the latest database state.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return {};

  return {
    title: `${pkg.name} | Char Dham Holidays`,
    description: pkg.tagline ?? pkg.routeOverview ?? undefined,
    alternates: { canonical: `/yatra/${pkg.slug}` },
  };
}

export default async function YatraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const dhamOptions = pkg.dhamChoice
    ? parseSteps((await getPackageBySlug("char-dham"))?.steps).filter((step) => step.featured)
    : [];

  return <YatraPageContent pkg={{ ...pkg, steps: parseSteps(pkg.steps) }} dhamOptions={dhamOptions} />;
}
