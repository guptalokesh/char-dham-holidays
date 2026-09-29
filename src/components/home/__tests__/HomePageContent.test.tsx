import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePageContent } from "@/components/home/HomePageContent";

const baseProps = {
  heroHeading: "Explore Uttarakhand",
  heroDescription: "Spiritual journeys, mountain treks and peaceful stays.",
  chardhamCtaLabel: "Explore Chardham",
  trekkingCtaLabel: "Explore Treks",
  chardhamPrice: 210000,
  whatsappNumber: "+91 98765 43210" as string | null,
  whatsappCtaText: "Chat on WhatsApp",
  contactCtaText: "Send an Enquiry",
};

describe("HomePageContent", () => {
  it("renders the hero heading, description and both hero CTAs", () => {
    render(<HomePageContent {...baseProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Explore Uttarakhand"
    );
    expect(screen.getByText(/spiritual journeys/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Chardham" })).toHaveAttribute(
      "href",
      "/chardham"
    );
    expect(screen.getByRole("link", { name: "Explore Treks" })).toHaveAttribute(
      "href",
      "/trekking"
    );
  });

  it("shows all three offering cards with correct links and pricing text", () => {
    render(<HomePageContent {...baseProps} />);

    expect(screen.getByRole("link", { name: /chardham yatra by helicopter/i })).toHaveAttribute(
      "href",
      "/chardham"
    );
    expect(screen.getByText(/₹2,10,000/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /trekking/i })).toHaveAttribute(
      "href",
      "/trekking"
    );
    expect(screen.getByText(/customised service/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /farm home stay/i })).toHaveAttribute(
      "href",
      "/farm-home-stay"
    );
  });

  it("shows the WhatsApp CTA when a number is configured", () => {
    render(<HomePageContent {...baseProps} />);
    expect(screen.getByRole("link", { name: /chat on whatsapp/i })).toBeInTheDocument();
  });

  it("hides the WhatsApp CTA when no number is configured", () => {
    render(<HomePageContent {...baseProps} whatsappNumber={null} />);
    expect(screen.queryByRole("link", { name: /chat on whatsapp/i })).not.toBeInTheDocument();
  });

  it("shows a Send an Enquiry link to the contact page", () => {
    render(<HomePageContent {...baseProps} />);
    expect(screen.getByRole("link", { name: /send an enquiry/i })).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  it("does not fabricate testimonials, awards or customer counts", () => {
    render(<HomePageContent {...baseProps} />);
    const text = document.body.textContent?.toLowerCase() ?? "";
    expect(text).not.toMatch(/testimonial|award|certified|5-star|customers served/);
  });
});
