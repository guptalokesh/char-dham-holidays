import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/layout/Header";

describe("Header logo", () => {
  it("renders the logo large enough to read, scaling up on wider screens", () => {
    render(
      <Header settings={{ businessName: "Char Dham Holidays", logoMedia: { url: "/seed-images/logo.jpg" } }} />
    );

    const logo = screen.getByRole("img", { name: "Char Dham Holidays" });
    expect(logo).toHaveClass("h-14", "sm:h-16");
  });
});

describe("Header navigation", () => {
  it("links to the Helicopter Yatra hub instead of the old Chardham page", () => {
    render(<Header settings={{ businessName: "Char Dham Holidays", logoMedia: null }} />);

    const nav = screen.getAllByRole("link", { name: "Helicopter Yatra" });
    expect(nav[0]).toHaveAttribute("href", "/yatra");
    expect(screen.queryByRole("link", { name: "Chardham" })).not.toBeInTheDocument();
  });
});
