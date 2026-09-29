"use client";

import { useState } from "react";

type EnquiryStatus = "NEW" | "CONTACTED" | "CLOSED";

export function EnquiryStatusSelect({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: EnquiryStatus;
}) {
  const [current, setCurrent] = useState<EnquiryStatus>(status);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as EnquiryStatus;
    const previous = current;
    setCurrent(next);
    setError(null);

    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to update.");
        setCurrent(previous);
      }
    } catch {
      setError("Failed to update.");
      setCurrent(previous);
    }
  }

  return (
    <div>
      <select
        aria-label="Enquiry status"
        value={current}
        onChange={handleChange}
        className="rounded border border-zinc-300 px-2 py-1 text-sm"
      >
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="CLOSED">Closed</option>
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
