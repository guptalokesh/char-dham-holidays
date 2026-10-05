"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface StepData {
  title: string;
  description: string;
  featured: boolean;
  imageUrl?: string;
}

interface YatraData {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price: number | null;
  routeOverview: string | null;
  startPoint: string | null;
  howItStarts: string | null;
  inclusions: string[];
  importantInfo: string | null;
  stayInfo: string;
  foodInfo: string;
  travelInfo: string;
  active: boolean;
  steps: StepData[];
  images: { id: string; url: string }[];
  itineraryMedia: { id: string; url: string } | null;
}

const INPUT = "w-full rounded border border-zinc-300 px-3 py-2";
const SMALL_BUTTON = "rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function YatraAdminForm({ initial }: { initial: YatraData }) {
  const [data, setData] = useState(initial);
  const [priceText, setPriceText] = useState(initial.price?.toString() ?? "");
  const [inclusionsText, setInclusionsText] = useState(initial.inclusions.join("\n"));
  const [steps, setSteps] = useState<StepData[]>(initial.steps);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateStep(index: number, patch: Partial<StepData>) {
    setSteps((current) => current.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/packages/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          tagline: data.tagline ?? "",
          price: priceText.trim() ? Number(priceText) : null,
          routeOverview: data.routeOverview ?? "",
          startPoint: data.startPoint ?? "",
          howItStarts: data.howItStarts ?? "",
          inclusions: toLines(inclusionsText),
          importantInfo: data.importantInfo ?? "",
          stayInfo: data.stayInfo,
          foodInfo: data.foodInfo,
          travelInfo: data.travelInfo,
          active: data.active,
          steps: steps.map(({ title, description, featured, imageUrl }) => ({
            title,
            description,
            featured,
            ...(imageUrl?.trim() ? { imageUrl: imageUrl.trim() } : {}),
          })),
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setData((current) => ({ ...current, ...json.chardhamPackage, steps: current.steps }));
      setMessage(json.message ?? "Listing updated successfully.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleItineraryUploaded(media: { id: string; url: string }) {
    const response = await fetch(`/api/admin/packages/${data.id}/itinerary`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: media.id }),
    });
    if (response.ok) {
      const json = await response.json();
      setData((current) => ({ ...current, itineraryMedia: json.chardhamPackage.itineraryMedia }));
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <Field id="yatra-name" label="Name">
          <input id="yatra-name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className={INPUT} />
        </Field>

        <Field id="yatra-tagline" label="Tagline (one line under the name)">
          <input id="yatra-tagline" value={data.tagline ?? ""} onChange={(e) => setData({ ...data, tagline: e.target.value })} className={INPUT} />
        </Field>

        <Field id="yatra-price" label="Price (₹ per person)" hint={'Leave empty to show "Price on request".'}>
          <input id="yatra-price" type="number" value={priceText} onChange={(e) => setPriceText(e.target.value)} className={INPUT} />
        </Field>

        <Field id="yatra-overview" label="Overview">
          <textarea id="yatra-overview" rows={3} value={data.routeOverview ?? ""} onChange={(e) => setData({ ...data, routeOverview: e.target.value })} className={INPUT} />
        </Field>

        <Field id="yatra-start" label="Start point (where it begins)">
          <input id="yatra-start" value={data.startPoint ?? ""} onChange={(e) => setData({ ...data, startPoint: e.target.value })} className={INPUT} />
        </Field>

        <Field id="yatra-how" label="How it starts">
          <textarea id="yatra-how" rows={3} value={data.howItStarts ?? ""} onChange={(e) => setData({ ...data, howItStarts: e.target.value })} className={INPUT} />
        </Field>

        <Field id="yatra-inclusions" label="What's usually included" hint="One item per line.">
          <textarea id="yatra-inclusions" rows={5} value={inclusionsText} onChange={(e) => setInclusionsText(e.target.value)} className={INPUT} />
        </Field>

        <Field id="yatra-good" label="Good to know" hint="One point per line.">
          <textarea id="yatra-good" rows={5} value={data.importantInfo ?? ""} onChange={(e) => setData({ ...data, importantInfo: e.target.value })} className={INPUT} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="yatra-stay" label="Stay (optional)">
            <input id="yatra-stay" value={data.stayInfo} onChange={(e) => setData({ ...data, stayInfo: e.target.value })} className={INPUT} />
          </Field>
          <Field id="yatra-food" label="Food (optional)">
            <input id="yatra-food" value={data.foodInfo} onChange={(e) => setData({ ...data, foodInfo: e.target.value })} className={INPUT} />
          </Field>
          <Field id="yatra-travel" label="Travel (optional)">
            <input id="yatra-travel" value={data.travelInfo} onChange={(e) => setData({ ...data, travelInfo: e.target.value })} className={INPUT} />
          </Field>
        </div>

        <fieldset className="space-y-3 rounded border border-zinc-200 p-4">
          <legend className="px-1 text-sm font-medium">Your journey, in order</legend>
          {steps.map((step, index) => (
            <div key={index} className="space-y-2 rounded border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-500">Step {index + 1}</span>
                <div className="flex gap-1">
                  <button type="button" className={SMALL_BUTTON} disabled={index === 0} aria-label={`Move up (step ${index + 1})`} onClick={() => moveStep(index, -1)}>
                    ↑
                  </button>
                  <button type="button" className={SMALL_BUTTON} disabled={index === steps.length - 1} aria-label={`Move down (step ${index + 1})`} onClick={() => moveStep(index, 1)}>
                    ↓
                  </button>
                  <button type="button" className={SMALL_BUTTON} aria-label={`Remove step ${index + 1}`} onClick={() => setSteps((current) => current.filter((_, i) => i !== index))}>
                    Remove
                  </button>
                </div>
              </div>
              <input aria-label="Step title" value={step.title} onChange={(e) => updateStep(index, { title: e.target.value })} className={INPUT} />
              <textarea aria-label="Step description" rows={3} value={step.description} onChange={(e) => updateStep(index, { description: e.target.value })} className={INPUT} />
              <input aria-label="Step image URL (optional)" placeholder="/seed-images/photo.jpg or https://…" value={step.imageUrl ?? ""} onChange={(e) => updateStep(index, { imageUrl: e.target.value })} className={INPUT} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={step.featured} onChange={(e) => updateStep(index, { featured: e.target.checked })} aria-label="This step is a dham" />
                This step is a dham (shown on the home page and in the dham list)
              </label>
            </div>
          ))}
          <button type="button" className="rounded border border-zinc-400 px-3 py-1.5 text-sm" onClick={() => setSteps((current) => [...current, { title: "", description: "", featured: false }])}>
            Add step
          </button>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.active} onChange={(e) => setData({ ...data, active: e.target.checked })} />
          Active (shown on the public site)
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button type="submit" disabled={saving} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">
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
            owner={{ chardhamPackageId: data.id }}
            label="Upload image"
            onUploaded={(media) => setData({ ...data, images: [...data.images, media] })}
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Itinerary PDF</h2>
        {data.itineraryMedia ? (
          <a href={data.itineraryMedia.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-blue-700 underline">
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
