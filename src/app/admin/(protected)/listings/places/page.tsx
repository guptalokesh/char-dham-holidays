import Link from "next/link";
import { listPlaces } from "@/lib/place";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  const places = await listPlaces({ activeOnly: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Devrana &amp; Base Camp</h1>
      <ul className="mt-6 space-y-3">
        {places.map((place) => (
          <li
            key={place.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div>
              <p className="font-medium">{place.title}</p>
              <p className="text-sm text-zinc-500">{place.active ? "Active" : "Hidden"}</p>
            </div>
            <Link
              href={`/admin/listings/places/${place.id}`}
              className="text-sm text-blue-700 underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
