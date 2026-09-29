"use client";

import { useState } from "react";

export function ActiveToggle({
  patchUrl,
  active,
  onChanged,
}: {
  patchUrl: string;
  active: boolean;
  onChanged?: (active: boolean) => void;
}) {
  const [current, setCurrent] = useState(active);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !current;
    setPending(true);
    setError(null);

    try {
      const response = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to update.");
        return;
      }

      setCurrent(next);
      onChanged?.(next);
    } catch {
      setError("Failed to update.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={current}
        disabled={pending}
        onClick={handleToggle}
        className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
          current ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {current ? "Active" : "Inactive"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
