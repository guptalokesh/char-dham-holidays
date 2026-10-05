import Image from "next/image";
import Link from "next/link";
import { formatPriceOrRequest } from "@/lib/format";
import { PhotoCredits } from "@/components/yatra/PhotoCredits";

export interface YatraCardView {
  slug: string;
  name: string;
  tagline: string | null;
  price: number | null;
  images: { url: string }[];
}

export function YatraHubContent({ yatras }: { yatras: YatraCardView[] }) {
  return (
    <article>
      <div className="bg-gradient-to-br from-blue-950 via-stone-900 to-amber-900 px-6 py-20 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Helicopter Yatra
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          Visit the dhams by helicopter
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone-200">
          Fly between the shrines of Uttarakhand and spend your time on darshan.
          Choose the yatra that suits you.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {yatras.length === 0 ? (
          <p className="text-center text-stone-600">
            Yatra details are coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {yatras.map((yatra) => (
              <Link
                key={yatra.slug}
                href={`/yatra/${yatra.slug}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-900 to-amber-700">
                  {yatra.images[0] && (
                    <Image
                      src={yatra.images[0].url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900">
                    {yatra.name}
                  </h2>
                  {yatra.tagline && (
                    <p className="mt-2 text-sm text-stone-600">
                      {yatra.tagline}
                    </p>
                  )}
                  <p className="mt-4 font-medium text-amber-800">
                    {formatPriceOrRequest(yatra.price)}
                    {yatra.price !== null && (
                      <span className="text-sm text-stone-500">
                        {" "}
                        per person
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10">
          <PhotoCredits urls={yatras.map((y) => y.images[0]?.url)} />
        </div>
      </div>
    </article>
  );
}
