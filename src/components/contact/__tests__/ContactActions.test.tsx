import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactActions } from "@/components/contact/ContactActions";

describe("ContactActions", () => {
  it("offers WhatsApp, call and email buttons from the business contact details", () => {
    render(<ContactActions phone="+91 8958405555" whatsappNumber="+91 8958405555" email="team@example.com" />);

    expect(screen.getByRole("link", { name: /contact on whatsapp/i }).getAttribute("href")).toContain(
      "wa.me/918958405555"
    );
    const call = screen.getByRole("link", { name: /call us \+91 8958405555/i });
    expect(call).toHaveAttribute("href", "tel:+918958405555");
    expect(screen.getByRole("link", { name: /email team@example.com/i })).toHaveAttribute(
      "href",
      "mailto:team@example.com"
    );
  });

  it("leaves out a button when its detail is missing", () => {
    render(<ContactActions phone={null} whatsappNumber={null} email="team@example.com" />);

    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /call us/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
  });
});
