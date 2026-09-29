"use client";

import { useId, useState } from "react";

interface MediaOwner {
  chardhamPackageId?: string;
  trekId?: string;
  farmPropertyId?: string;
  roomId?: string;
}

interface UploadedMedia {
  id: string;
  url: string;
}

export function MediaUploader({
  purpose,
  owner,
  label,
  onUploaded,
}: {
  purpose: "IMAGE" | "PDF";
  owner?: MediaOwner;
  label: string;
  onUploaded?: (media: UploadedMedia) => void;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);
    for (const [key, value] of Object.entries(owner ?? {})) {
      if (value) formData.append(key, value);
    }

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      onUploaded?.(data.media);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={purpose === "IMAGE" ? "image/*" : "application/pdf"}
        disabled={uploading}
        onChange={handleChange}
        className="mt-1 block text-sm"
      />
      {uploading && <p className="mt-1 text-xs text-zinc-500">Uploading...</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
