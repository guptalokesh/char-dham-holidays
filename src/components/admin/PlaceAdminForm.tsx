"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface PlaceData {
  id: string;
  title: string;
  summary: string;
  body: string;
  address: string | null;
  mapLink: string | null;
  active: boolean;
  images: { id: string; url: string }[];
}

export function PlaceAdminForm({ initial }: { initial: PlaceData }) {
  const [data, setData] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/places/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          body: data.body,
          address: data.address ?? "",
          mapLink: data.mapLink ?? "",
          active: data.active,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setData(json.place);
      setMessage(json.message ?? "Listing updated successfully.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label htmlFor="place-admin-title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="place-admin-title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="place-admin-summary" className="block text-sm font-medium">
            Short summary
          </label>
          <input
            id="place-admin-summary"
            value={data.summary}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="place-admin-body" className="block text-sm font-medium">
            Details
          </label>
          <textarea
            id="place-admin-body"
            rows={6}
            value={data.body}
            onChange={(e) => setData({ ...data, body: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="place-admin-address" className="block text-sm font-medium">
            Address
          </label>
          <input
            id="place-admin-address"
            value={data.address ?? ""}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="place-admin-map" className="block text-sm font-medium">
            Google Maps link
          </label>
          <input
            id="place-admin-map"
            type="url"
            value={data.mapLink ?? ""}
            onChange={(e) => setData({ ...data, mapLink: e.target.value })}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.active}
            onChange={(e) => setData({ ...data, active: e.target.checked })}
          />
          Active (shown on the public site)
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
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.id} src={image.url} alt="" className="h-24 w-32 rounded object-cover" />
          ))}
        </div>
        <div className="mt-4">
          <MediaUploader
            purpose="IMAGE"
            owner={{ placeId: data.id }}
            label="Upload image"
            onUploaded={(media) => setData({ ...data, images: [...data.images, media] })}
          />
        </div>
      </div>
    </div>
  );
}
