import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";

const baseSettings = {
  businessName: "Char Dham Holidays",
  whatsappNumber: null as string | null,
  primaryPhone: null as string | null,
  primaryEmail: null as string | null,
  addressLine: null as string | null,
  city: null as string | null,
  instagramUrl: null as string | null,
  facebookUrl: null as string | null,
  youtubeUrl: null as string | null,
  otherSocialUrl: null as string | null,
  footerCopyrightText: null as string | null,
  whatsappCtaText: "Chat on WhatsApp",
  logoMedia: null as { url: string } | null,
};

describe("Footer", () => {
  it("hides contact fields and social links entirely when unset", () => {
    render(<Footer settings={baseSettings} />);

    expect(screen.queryByText(/phone:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /instagram/i })).not.toBeInTheDocument();
  });

  it("shows only the social links that are configured", () => {
    render(
      <Footer
        settings={{
          ...baseSettings,
          instagramUrl: "https://instagram.com/chardhamholidays",
        }}
      />
    );

    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      "https://instagram.com/chardhamholidays"
    );
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument();
  });

  it("shows configured contact details", () => {
    render(
      <Footer
        settings={{
          ...baseSettings,
          primaryPhone: "+91 98765 43210",
          primaryEmail: "hello@chardhamholidays.example",
        }}
      />
    );

    expect(screen.getByText("+91 98765 43210")).toBeInTheDocument();
    expect(screen.getByText("hello@chardhamholidays.example")).toBeInTheDocument();
  });

  it("falls back to a generated copyright line when none is configured", () => {
    render(<Footer settings={baseSettings} />);
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it("uses the configured footer copyright text when present", () => {
    render(
      <Footer settings={{ ...baseSettings, footerCopyrightText: "Custom footer text" }} />
    );
    expect(screen.getByText("Custom footer text")).toBeInTheDocument();
  });

  it("always shows Privacy Policy and Terms links", () => {
    render(<Footer settings={baseSettings} />);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute("href", "/terms");
  });
});
