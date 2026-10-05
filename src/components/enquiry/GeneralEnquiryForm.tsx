"use client";

import { useState } from "react";

export interface EnquiryServiceOptionProp {
  service: "GENERAL" | "CHARDHAM" | "TREKKING" | "FARM_HOME_STAY";
  trekId?: string;
  chardhamPackageId?: string;
  label: string;
}

export function GeneralEnquiryForm({
  serviceOptions,
}: {
  serviceOptions: EnquiryServiceOptionProp[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceIndex, setServiceIndex] = useState("0");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Name is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (!email.trim()) return "Email is required.";
    if (!message.trim()) return "Message is required.";
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

    const option = serviceOptions[Number(serviceIndex)];

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          service: option.service,
          trekId: option.trekId,
          chardhamPackageId: option.chardhamPackageId,
          message,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again or contact us on WhatsApp.");
        return;
      }

      setConfirmed(true);
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="enquiry-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="enquiry-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="enquiry-phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="enquiry-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="enquiry-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="enquiry-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="enquiry-service" className="block text-sm font-medium">
          Service
        </label>
        <select
          id="enquiry-service"
          value={serviceIndex}
          onChange={(e) => setServiceIndex(e.target.value)}
          className="form-input"
        >
          {serviceOptions.map((option, index) => (
            <option key={`${option.service}-${option.trekId ?? option.chardhamPackageId ?? index}`} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="enquiry-message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="enquiry-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
          Thank you — we&apos;ve received your enquiry and will get back to you
          shortly. A confirmation email has been sent to you.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn bg-stone-900 hover:bg-stone-800"
      >
        {submitting ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
