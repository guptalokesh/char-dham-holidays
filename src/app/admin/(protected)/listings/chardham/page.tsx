import { getChardhamPackage } from "@/lib/chardham";
import { ChardhamAdminForm } from "@/components/admin/ChardhamAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminChardhamPage() {
  const chardhamPackage = await getChardhamPackage();

  return (
    <div>
      <h1 className="text-xl font-semibold">Chardham Yatra by Helicopter</h1>
      <div className="mt-6">
        <ChardhamAdminForm initial={chardhamPackage} />
      </div>
    </div>
  );
}
