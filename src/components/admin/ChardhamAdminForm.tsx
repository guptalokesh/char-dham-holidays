"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface ChardhamPackageData {
  id: string;
  name: string;
  price: number;
  destinations: string[];
  stayInfo: string;
  foodInfo: string;
  travelInfo: string;
  travelPeriod: string | null;
  routeOverview: string | null;
  importantInfo: string | null;
  active: boolean;
  images: { id: string; url: string }[];
  itineraryMedia: { id: string; url: string } | null;
}

export function ChardhamAdminForm({ initial }: { initial: ChardhamPackageData }) {
  const [data, setData] = useState(initial);
  const [destinationsText, setDestinationsText] = useState(initial.destinations.join(", "));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch("/api/admin/chardham", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          price: Number(data.price),
          destinations: destinationsText
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          stayInfo: data.stayInfo,
          foodInfo: data.foodInfo,
          travelInfo: data.travelInfo,
          travelPeriod: data.travelPeriod ?? "",
          routeOverview: data.routeOverview ?? "",
          importantInfo: data.importantInfo ?? "",
          active: data.active,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setData(json.chardhamPackage);
      setMessage(json.message ?? "Settings saved successfully.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleItineraryUploaded(media: { id: string; url: string }) {
    const response = await fetch("/api/admin/chardham/itinerary", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: media.id }),
    });
    if (response.ok) {
      const json = await response.json();
      setData(json.chardhamPackage);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium">
            Price (₹ per person)
          </label>
          <input
            id="price"
            type="number"
            value={data.price}
            onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="destinations" className="block text-sm font-medium">
            Destinations (comma-separated)
          </label>
          <input
            id="destinations"
            value={destinationsText}
            onChange={(e) => setDestinationsText(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="stayInfo" className="block text-sm font-medium">
              Stay
            </label>
            <input
              id="stayInfo"
              value={data.stayInfo}
              onChange={(e) => setData({ ...data, stayInfo: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="foodInfo" className="block text-sm font-medium">
              Food
            </label>
            <input
              id="foodInfo"
              value={data.foodInfo}
              onChange={(e) => setData({ ...data, foodInfo: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="travelInfo" className="block text-sm font-medium">
              Travel
            </label>
            <input
              id="travelInfo"
              value={data.travelInfo}
              onChange={(e) => setData({ ...data, travelInfo: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="travelPeriod" className="block text-sm font-medium">
            Available travel period (optional)
          </label>
          <input
            id="travelPeriod"
            value={data.travelPeriod ?? ""}
            onChange={(e) => setData({ ...data, travelPeriod: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="routeOverview" className="block text-sm font-medium">
            Route overview (optional)
          </label>
          <textarea
            id="routeOverview"
            rows={3}
            value={data.routeOverview ?? ""}
            onChange={(e) => setData({ ...data, routeOverview: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="importantInfo" className="block text-sm font-medium">
            Important information (optional)
          </label>
          <textarea
            id="importantInfo"
            rows={3}
            value={data.importantInfo ?? ""}
            onChange={(e) => setData({ ...data, importantInfo: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.active}
            onChange={(e) => setData({ ...data, active: e.target.checked })}
          />
          Active (bookable on the public site)
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {data.images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              className="h-24 w-32 rounded object-cover"
            />
          ))}
        </div>
        <div className="mt-4">
          <MediaUploader
            purpose="IMAGE"
            owner={{ chardhamPackageId: data.id }}
            label="Upload image"
            onUploaded={(media) => setData({ ...data, images: [...data.images, media] })}
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Itinerary PDF</h2>
        {data.itineraryMedia ? (
          <a
            href={data.itineraryMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm text-blue-700 underline"
          >
            View current itinerary
          </a>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No itinerary uploaded yet.</p>
        )}
        <div className="mt-4">
          <MediaUploader
            purpose="PDF"
            label="Upload itinerary PDF"
            onUploaded={handleItineraryUploaded}
          />
        </div>
      </div>
    </div>
  );
}
