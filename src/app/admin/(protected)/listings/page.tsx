import Link from "next/link";

export default function AdminListingsIndexPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Manage Listings</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/listings/yatras"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-semibold">Helicopter Yatras</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Char Dham, Any Dham and Yamunotri-Gangotri handling: text, price, journey steps and photos.
          </p>
        </Link>
        <Link
          href="/admin/listings/treks"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-semibold">Trekking</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage treks, add new ones, images and itineraries.
          </p>
        </Link>
        <Link
          href="/admin/listings/farm"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-semibold">Farm Home Stay</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Property details, rooms, prices and amenities.
          </p>
        </Link>
        <Link
          href="/admin/listings/places"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-semibold">Devrana &amp; Base Camp</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mandir, mela and Dhari–Kalogi base camp text, address and photos.
          </p>
        </Link>
      </div>
    </div>
  );
}
