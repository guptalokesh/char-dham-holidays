import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";

describe("WhatsAppCta", () => {
  it("renders a wa.me link with the encoded message when a number is configured", () => {
    render(
      <WhatsAppCta phone="+91 98765 43210" message="Hello there" label="Chat on WhatsApp" />
    );

    const link = screen.getByRole("link", { name: /chat on whatsapp/i });
    expect(link).toHaveAttribute("href", "https://wa.me/919876543210?text=Hello%20there");
  });

  it("renders nothing when no phone number is configured", () => {
    const { container } = render(
      <WhatsAppCta phone={null} message="Hello there" label="Chat on WhatsApp" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
