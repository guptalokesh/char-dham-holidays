"use client";

import { useState } from "react";
import { DHAM_NAMES } from "@/lib/validation/chardham";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ChardhamAvailabilityForm({
  packageSlug = "char-dham",
  dhamChoice = false,
}: {
  packageSlug?: string;
  dhamChoice?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [travellers, setTravellers] = useState("1");
  const [dhams, setDhams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Name is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (dhamChoice && dhams.length === 0) return "Please choose at least one dham.";
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
          packageSlug,
          ...(dhamChoice && { dhams }),
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
      {dhamChoice && (
        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium">Which dham or dhams would you like to visit?</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {DHAM_NAMES.map((dham) => (
              <label key={dham} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dhams.includes(dham)}
                  onChange={(e) =>
                    setDhams((current) =>
                      e.target.checked
                        ? DHAM_NAMES.filter((d) => d === dham || current.includes(d))
                        : current.filter((d) => d !== dham)
                    )
                  }
                />
                {dham}
              </label>
            ))}
          </div>
        </fieldset>
      )}

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
          className="form-input"
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
          className="form-input"
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
          className="form-input"
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
          className="form-input"
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
          availability. Booking is subject to confirmation by our team.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn bg-stone-900 hover:bg-stone-800"
      >
        {submitting ? "Sending..." : "Check Availability"}
      </button>
    </form>
  );
}
