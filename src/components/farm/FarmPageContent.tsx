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

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-green-900">
        Farm Home Stay
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-700">{property.description}</p>
      {property.location && (
        <p className="mt-2 text-sm text-zinc-500">{property.location}</p>
      )}

      {property.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {property.images.map((image, index) => (
            <div key={image.url} className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={image.url}
                alt="Farm Home Stay"
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Rooms</h2>
        {activeRooms.length === 0 ? (
          <p className="mt-2 text-zinc-500">Room details will be available soon.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeRooms.map((room) => (
              <div key={room.id} className="rounded-lg border border-green-100 p-4">
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-zinc-600">Up to {room.capacity} guests</p>
                <p className="mt-1 font-medium text-green-800">
                  {formatInr(room.price)} <span className="text-sm text-zinc-500">/ night</span>
                </p>
                {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {(room.amenities as string[]).map((amenity) => (
                      <li
                        key={amenity}
                        className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-800"
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

      <section className="mt-10 rounded-lg border border-green-100 p-6">
        <h2 className="text-lg font-semibold">Check availability</h2>
        {property.active ? (
          <div className="mt-4">
            <FarmAvailabilitySearch />
          </div>
        ) : (
          <p className="mt-2 text-zinc-600">
            Farm Home Stay is currently unavailable for booking. Please check back
            soon or contact us for more details.
          </p>
        )}
      </section>
    </article>
  );
}
