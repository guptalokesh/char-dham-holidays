"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface TrekData {
  id: string;
  name: string;
  description: string;
  price: number | null;
  active: boolean;
  images: { id: string; url: string }[];
  itineraryMedia: { id: string; url: string } | null;
}

export function TrekAdminForm({ initial }: { initial: TrekData }) {
  const [data, setData] = useState(initial);
  const [priceText, setPriceText] = useState(initial.price?.toString() ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/treks/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: priceText.trim() ? Number(priceText) : "",
          active: data.active,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setData(json.trek);
      setMessage(json.message ?? "Listing updated successfully.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleItineraryUploaded(media: { id: string; url: string }) {
    const response = await fetch(`/api/admin/treks/${data.id}/itinerary`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: media.id }),
    });
    if (response.ok) {
      const json = await response.json();
      setData(json.trek);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label htmlFor="trek-admin-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="trek-admin-name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="trek-admin-description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="trek-admin-description"
            rows={4}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="trek-admin-price" className="block text-sm font-medium">
            Price (₹ — leave blank for &quot;Customised service&quot;)
          </label>
          <input
            id="trek-admin-price"
            type="number"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
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
            <img key={image.id} src={image.url} alt="" className="h-24 w-32 rounded object-cover" />
          ))}
        </div>
        <div className="mt-4">
          <MediaUploader
            purpose="IMAGE"
            owner={{ trekId: data.id }}
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
          <MediaUploader purpose="PDF" label="Upload itinerary PDF" onUploaded={handleItineraryUploaded} />
        </div>
      </div>
    </div>
  );
}
