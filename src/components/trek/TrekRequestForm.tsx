"use client";

import { useState } from "react";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TrekRequestForm({ trekSlug }: { trekSlug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [people, setPeople] = useState("1");
  const [requirements, setRequirements] = useState("");
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
    const count = Number(people);
    if (!Number.isInteger(count) || count < 1) {
      return "Enter a valid number of people.";
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
      const response = await fetch(`/api/trek/${trekSlug}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferredDate,
          people: Number(people),
          requirements: requirements.trim() || undefined,
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
        <label htmlFor="trek-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="trek-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="trek-phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="trek-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="trek-people" className="block text-sm font-medium">
          Number of people
        </label>
        <input
          id="trek-people"
          type="number"
          min={1}
          max={50}
          required
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="trek-date" className="block text-sm font-medium">
          Preferred date
        </label>
        <input
          id="trek-date"
          type="date"
          required
          min={todayIsoDate()}
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="trek-requirements" className="block text-sm font-medium">
          Additional requirements (optional)
        </label>
        <textarea
          id="trek-requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
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
          We&apos;ve received your request and will contact you shortly to discuss
          availability and pricing. Booking is subject to confirmation by our team.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn bg-emerald-700 hover:bg-emerald-800"
      >
        {submitting ? "Sending..." : "Request Availability"}
      </button>
    </form>
  );
}
