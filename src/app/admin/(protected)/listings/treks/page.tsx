import { listTreks } from "@/lib/trek";
import { TrekAdminList } from "@/components/admin/TrekAdminList";

export const dynamic = "force-dynamic";

export default async function AdminTreksPage() {
  const treks = await listTreks({ activeOnly: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Trekking</h1>
      <div className="mt-6">
        <TrekAdminList initial={treks} />
      </div>
    </div>
  );
}
