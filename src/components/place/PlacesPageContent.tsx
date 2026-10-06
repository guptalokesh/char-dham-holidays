import Image from "next/image";

export interface PlaceView {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  address: string | null;
  mapLink: string | null;
  images: { url: string }[];
}

export function PlacesPageContent({ places }: { places: PlaceView[] }) {
  return (
    <section
      id="devrana-mandir"
      aria-labelledby="devrana-heading"
      className="mx-auto max-w-5xl scroll-mt-24 px-6 py-16"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
        Uttarakhand
      </p>
      <h2 id="devrana-heading" className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
        Devrana Mandir &amp; Base Camp
      </h2>
      <div className="mt-8">
        {places.length === 0 ? (
          <p className="text-stone-600">Details are coming soon.</p>
        ) : (
          places.map((place, index) => (
            <section
              key={place.id}
              id={place.slug}
              aria-labelledby={`place-${place.slug}`}
              className={index > 0 ? "mt-16 border-t border-stone-200 pt-12" : ""}
            >
              <h3 id={`place-${place.slug}`} className="text-2xl font-semibold text-stone-900">
                {place.title}
              </h3>
              <p className="mt-2 text-lg text-amber-800">{place.summary}</p>
              <p className="mt-4 max-w-2xl text-stone-700">{place.body}</p>

              {(place.address || place.mapLink) && (
                <p className="mt-4 text-sm text-stone-600">
                  {place.address}
                  {place.mapLink && (
                    <>
                      {place.address && " · "}
                      <a
                        href={place.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-800 underline underline-offset-2"
                      >
                        View on map
                      </a>
                    </>
                  )}
                </p>
              )}

              {place.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {place.images.map((image, i) => (
                    <div
                      key={image.url}
                      className={`relative overflow-hidden rounded-xl ${
                        i === 0 ? "col-span-2 aspect-video sm:row-span-2" : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${place.title} — photo ${i + 1}`}
                        fill
                        sizes={i === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </section>
  );
}
