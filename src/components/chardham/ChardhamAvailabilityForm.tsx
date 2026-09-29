"use client";

import { useState } from "react";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ChardhamAvailabilityForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [travellers, setTravellers] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Name is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (!preferredDate) return "Preferred date is required.";
    if (preferredDate < todayIsoDate()) {
      return "Preferred date cannot be in the past.";
    }
    const travellerCount = Number(travellers);
    if (!Number.isInteger(travellerCount) || travellerCount < 1) {
      return "Enter a valid number of travellers.";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setConfirmed(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/chardham/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferredDate,
          travellers: Number(travellers),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again or contact us on WhatsApp.");
        return;
      }

      setConfirmed(true);
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="chardham-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="chardham-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="chardham-phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="chardham-phone"
          name="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="chardham-date" className="block text-sm font-medium">
          Preferred date
        </label>
        <input
          id="chardham-date"
          name="preferredDate"
          type="date"
          required
          min={todayIsoDate()}
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="chardham-travellers" className="block text-sm font-medium">
          Number of travellers
        </label>
        <input
          id="chardham-travellers"
          name="travellers"
          type="number"
          min={1}
          max={50}
          required
          value={travellers}
          onChange={(e) => setTravellers(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {confirmed && (
        <p className="text-sm text-green-700">
          We&apos;ve received your request and will contact you shortly to confirm
          availability. Booking is subject to organiser confirmation.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Check Availability"}
      </button>
    </form>
  );
}
