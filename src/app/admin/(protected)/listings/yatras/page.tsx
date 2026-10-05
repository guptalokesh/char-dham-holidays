import Link from "next/link";
import { listPackages } from "@/lib/packages";
import { formatPriceOrRequest } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminYatrasPage() {
  const yatras = await listPackages({ activeOnly: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Helicopter Yatras</h1>
      <ul className="mt-6 space-y-3">
        {yatras.map((yatra) => (
          <li key={yatra.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
            <div>
              <p className="font-medium">{yatra.name}</p>
              <p className="text-sm text-zinc-500">
                {formatPriceOrRequest(yatra.price)} · {yatra.active ? "Active" : "Hidden"}
              </p>
            </div>
            <Link href={`/admin/listings/yatras/${yatra.id}`} className="text-sm text-blue-700 underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
