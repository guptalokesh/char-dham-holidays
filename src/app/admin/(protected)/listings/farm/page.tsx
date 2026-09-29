import { getFarmProperty } from "@/lib/farm";
import { FarmAdminPanel } from "@/components/admin/FarmAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminFarmPage() {
  const property = await getFarmProperty();

  return (
    <div>
      <h1 className="text-xl font-semibold">Farm Home Stay</h1>
      <div className="mt-6">
        <FarmAdminPanel initial={property} />
      </div>
    </div>
  );
}
