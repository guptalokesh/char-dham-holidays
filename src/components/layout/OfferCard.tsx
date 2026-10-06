import type { ReactNode } from "react";
import Link from "next/link";
import { formatPriceOrRequest } from "@/lib/format";

export function OfferCard({
  charDhamPrice,
  anyDhamPrice,
  titleId,
  onNavigate,
  corner,
}: {
  charDhamPrice: number | null;
  anyDhamPrice: number | null;
  titleId: string;
  onNavigate?: () => void;
  corner?: ReactNode;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-800">April – June &amp; September – October</p>
          <h2 id={titleId} className="mt-1 text-xl font-semibold text-stone-900">
            Helicopter yatra season is open
          </h2>
        </div>
        {corner}
      </div>

      <p className="mt-3 text-stone-700">
        Experience the sacred journey to Yamunotri, Gangotri, Kedarnath and Badrinath by
        helicopter. Stay, meals, pick-up in Dehradun and help with darshan are included in
        the Char Dham yatra.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-sm text-stone-600">Char Dham Yatra</p>
          <p className="mt-1 font-semibold text-amber-800">{formatPriceOrRequest(charDhamPrice)}</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-sm text-stone-600">Any Dham Yatra</p>
          <p className="mt-1 font-semibold text-sky-800">{formatPriceOrRequest(anyDhamPrice)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/yatra/char-dham"
          onClick={onNavigate}
          className="rounded-lg bg-orange-700 px-4 py-2.5 text-center font-medium text-white hover:bg-orange-800"
        >
          Book now
        </Link>
        <Link
          href="/yatra"
          onClick={onNavigate}
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-center font-medium text-white hover:bg-blue-800"
        >
          View packages
        </Link>
      </div>
    </>
  );
}
