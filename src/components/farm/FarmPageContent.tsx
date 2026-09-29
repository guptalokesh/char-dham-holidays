import Image from "next/image";
import { formatInr } from "@/lib/format";
import { FarmAvailabilitySearch } from "@/components/farm/FarmAvailabilitySearch";

interface RoomSummary {
  id: string;
  name: string;
  price: number;
  capacity: number;
  amenities: unknown;
  active: boolean;
  images: { url: string }[];
}

export interface FarmPageContentProps {
  property: {
    description: string;
    location: string | null;
    mapLink: string | null;
    active: boolean;
    images: { url: string }[];
    rooms: RoomSummary[];
  };
}

export function FarmPageContent({ property }: FarmPageContentProps) {
  const activeRooms = property.rooms.filter((room) => room.active);
  const heroImage = property.images[0];
  const galleryImages = property.images.slice(1);

  return (
    <article>
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-green-950">
        {heroImage && (
          <Image
            src={heroImage.url}
            alt="Farm Home Stay"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/30 to-green-950/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-300">
            Farm Home Stay
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Farm Home Stay
          </h1>
          {property.location && (
            <p className="mt-2 text-green-100">{property.location}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="max-w-2xl text-stone-700">{property.description}</p>

        {galleryImages.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryImages.map((image) => (
              <div key={image.url} className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={image.url}
                  alt="Farm Home Stay"
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">Rooms</h2>
          {activeRooms.length === 0 ? (
            <p className="mt-2 text-stone-500">Room details will be available soon.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {activeRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-green-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="font-semibold text-stone-900">{room.name}</h3>
                  <p className="text-sm text-stone-600">Up to {room.capacity} guests</p>
                  <p className="mt-1 font-medium text-green-800">
                    {formatInr(room.price)} <span className="text-sm text-stone-500">/ night</span>
                  </p>
                  {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {(room.amenities as string[]).map((amenity) => (
                        <li
                          key={amenity}
                          className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800"
                        >
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Check availability</h2>
          {property.active ? (
            <div className="mt-4">
              <FarmAvailabilitySearch />
            </div>
          ) : (
            <p className="mt-2 text-stone-600">
              Farm Home Stay is currently unavailable for booking. Please check back
              soon or contact us for more details.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
