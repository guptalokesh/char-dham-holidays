import { notFound } from "next/navigation";
import { getPackageById, parseSteps } from "@/lib/packages";
import { YatraAdminForm } from "@/components/admin/YatraAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminYatraEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const yatra = await getPackageById(id);
  if (!yatra) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{yatra.name}</h1>
      <div className="mt-6">
        <YatraAdminForm initial={{ ...yatra, steps: parseSteps(yatra.steps) }} />
      </div>
    </div>
  );
}
