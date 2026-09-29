"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface SettingsData {
  businessName: string;
  shortDescription: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  mapLink: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  whatsappNumber: string | null;
  primaryEmail: string | null;
  enquiryEmail: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  otherSocialUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  trekkingAccentColor: string;
  heroHeading: string | null;
  heroDescription: string | null;
  chardhamCtaLabel: string | null;
  trekkingCtaLabel: string | null;
  whatsappCtaText: string | null;
  contactCtaText: string | null;
  footerCopyrightText: string | null;
  logoMediaId?: string | null;
  faviconMediaId?: string | null;
}

type FieldKey = keyof SettingsData;

function TextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-300 px-3 py-2"
      />
    </div>
  );
}

export function SettingsAdminForm({ initial }: { initial: SettingsData }) {
  const [data, setData] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField(key: FieldKey, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function field(key: FieldKey): string {
    return (data[key] as string | null) ?? "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const patch: Record<string, string> = {};
    for (const key of Object.keys(data) as FieldKey[]) {
      if (data[key] !== initial[key]) {
        patch[key] = (data[key] as string | null) ?? "";
      }
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setData(json.settings);
      setMessage(json.message ?? "Settings saved successfully.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 font-semibold">Business</legend>
        <TextField id="businessName" label="Business name" value={field("businessName")} onChange={(v) => setField("businessName", v)} />
        <TextField id="shortDescription" label="Short description" value={field("shortDescription")} onChange={(v) => setField("shortDescription", v)} />
        <TextField id="addressLine" label="Address" value={field("addressLine")} onChange={(v) => setField("addressLine", v)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="city" label="City" value={field("city")} onChange={(v) => setField("city", v)} />
          <TextField id="state" label="State" value={field("state")} onChange={(v) => setField("state", v)} />
          <TextField id="country" label="Country" value={field("country")} onChange={(v) => setField("country", v)} />
        </div>
        <TextField id="mapLink" label="Google Maps link" value={field("mapLink")} onChange={(v) => setField("mapLink", v)} />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 font-semibold">Contact</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="primaryPhone" label="Primary phone" value={field("primaryPhone")} onChange={(v) => setField("primaryPhone", v)} />
          <TextField id="secondaryPhone" label="Secondary phone" value={field("secondaryPhone")} onChange={(v) => setField("secondaryPhone", v)} />
        </div>
        <TextField id="whatsappNumber" label="WhatsApp number" value={field("whatsappNumber")} onChange={(v) => setField("whatsappNumber", v)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="primaryEmail" label="Primary email" value={field("primaryEmail")} onChange={(v) => setField("primaryEmail", v)} />
          <TextField id="enquiryEmail" label="Enquiry email" value={field("enquiryEmail")} onChange={(v) => setField("enquiryEmail", v)} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 font-semibold">Social</legend>
        <TextField id="instagramUrl" label="Instagram URL" value={field("instagramUrl")} onChange={(v) => setField("instagramUrl", v)} />
        <TextField id="facebookUrl" label="Facebook URL" value={field("facebookUrl")} onChange={(v) => setField("facebookUrl", v)} />
        <TextField id="youtubeUrl" label="YouTube URL" value={field("youtubeUrl")} onChange={(v) => setField("youtubeUrl", v)} />
        <TextField id="otherSocialUrl" label="Other social URL" value={field("otherSocialUrl")} onChange={(v) => setField("otherSocialUrl", v)} />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 font-semibold">Branding</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="primaryColor" label="Primary colour" value={field("primaryColor")} onChange={(v) => setField("primaryColor", v)} />
          <TextField id="secondaryColor" label="Secondary colour" value={field("secondaryColor")} onChange={(v) => setField("secondaryColor", v)} />
          <TextField id="trekkingAccentColor" label="Trekking accent colour" value={field("trekkingAccentColor")} onChange={(v) => setField("trekkingAccentColor", v)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MediaUploader
            purpose="IMAGE"
            label="Upload logo"
            onUploaded={(media) => setData((prev) => ({ ...prev, logoMediaId: media.id }))}
          />
          <MediaUploader
            purpose="IMAGE"
            label="Upload favicon"
            onUploaded={(media) => setData((prev) => ({ ...prev, faviconMediaId: media.id }))}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <legend className="px-1 font-semibold">Website content</legend>
        <TextField id="heroHeading" label="Homepage hero heading" value={field("heroHeading")} onChange={(v) => setField("heroHeading", v)} />
        <TextField id="heroDescription" label="Homepage hero description" value={field("heroDescription")} onChange={(v) => setField("heroDescription", v)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="chardhamCtaLabel" label="Chardham CTA label" value={field("chardhamCtaLabel")} onChange={(v) => setField("chardhamCtaLabel", v)} />
          <TextField id="trekkingCtaLabel" label="Trekking CTA label" value={field("trekkingCtaLabel")} onChange={(v) => setField("trekkingCtaLabel", v)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="whatsappCtaText" label="WhatsApp CTA text" value={field("whatsappCtaText")} onChange={(v) => setField("whatsappCtaText", v)} />
          <TextField id="contactCtaText" label="Contact CTA text" value={field("contactCtaText")} onChange={(v) => setField("contactCtaText", v)} />
        </div>
        <TextField id="footerCopyrightText" label="Footer copyright text" value={field("footerCopyrightText")} onChange={(v) => setField("footerCopyrightText", v)} />
      </fieldset>

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
  );
}
