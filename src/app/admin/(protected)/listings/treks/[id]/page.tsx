import { notFound } from "next/navigation";
import { getTrekById } from "@/lib/trek";
import { TrekAdminForm } from "@/components/admin/TrekAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminTrekEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trek = await getTrekById(id);
  if (!trek) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{trek.name}</h1>
      <div className="mt-6">
        <TrekAdminForm initial={trek} />
      </div>
    </div>
  );
}
