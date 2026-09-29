import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrekBySlug } from "@/lib/trek";
import { TrekPageContent } from "@/components/trek/TrekPageContent";

// Admin-editable content must always reflect the latest database state.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const trek = await getTrekBySlug(slug);
  if (!trek) return {};

  return {
    title: `${trek.name} | Char Dham Holidays`,
    description: trek.description,
    alternates: { canonical: `/trekking/${trek.slug}` },
  };
}

export default async function TrekDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trek = await getTrekBySlug(slug);

  if (!trek) {
    notFound();
  }

  return <TrekPageContent trek={trek} />;
}
