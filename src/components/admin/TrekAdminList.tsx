"use client";

import { useState } from "react";
import Link from "next/link";
import { ActiveToggle } from "@/components/admin/ActiveToggle";

interface TrekSummary {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  active: boolean;
}

export function TrekAdminList({ initial }: { initial: TrekSummary[] }) {
  const [treks, setTreks] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/admin/treks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setTreks([...treks, data.trek]);
      setName("");
      setDescription("");
    } catch {
      setError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {treks.map((trek) => (
              <tr key={trek.id}>
                <td className="px-4 py-2">{trek.name}</td>
                <td className="px-4 py-2">{trek.price ?? "Customised"}</td>
                <td className="px-4 py-2">
                  <ActiveToggle
                    patchUrl={`/api/admin/treks/${trek.id}`}
                    active={trek.active}
                    onChanged={(active) =>
                      setTreks((prev) =>
                        prev.map((t) => (t.id === trek.id ? { ...t, active } : t))
                      )
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/listings/treks/${trek.id}`} className="text-blue-700 underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <h2 className="font-semibold">Add a new trek</h2>
        <div className="space-y-1">
          <label htmlFor="new-trek-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="new-trek-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="new-trek-description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="new-trek-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add trek"}
        </button>
      </form>
    </div>
  );
}
