import { notFound } from "next/navigation";
import { getPlaceById } from "@/lib/place";
import { PlaceAdminForm } from "@/components/admin/PlaceAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminPlaceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceById(id);
  if (!place) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{place.title}</h1>
      <div className="mt-6">
        <PlaceAdminForm initial={place} />
      </div>
    </div>
  );
}
