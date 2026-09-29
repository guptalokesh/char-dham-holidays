import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/format";

export interface TrekCardProps {
  trek: {
    slug: string;
    name: string;
    description: string;
    price: number | null;
    images: { url: string }[];
  };
  priority?: boolean;
}

export function TrekCard({ trek, priority }: TrekCardProps) {
  return (
    <Link
      href={`/trekking/${trek.slug}`}
      className="block overflow-hidden rounded-lg border border-emerald-100 transition-shadow hover:shadow-md"
    >
      {trek.images[0] && (
        <div className="relative aspect-video">
          <Image
            src={trek.images[0].url}
            alt={trek.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-emerald-900">{trek.name}</h3>
        <p className="mt-1 text-sm text-zinc-600">{trek.description}</p>
        <p className="mt-2 font-medium text-emerald-800">
          {trek.price ? formatInr(trek.price) : "Customised service"}
        </p>
      </div>
    </Link>
  );
}
