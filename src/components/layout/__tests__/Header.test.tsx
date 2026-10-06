import { render, screen, within } from "@testing-library/react";
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
  const settings = { businessName: "Char Dham Holidays", logoMedia: null };

  it("lists the menu in order, with Devrana covered under Trekking", () => {
    render(<Header settings={settings} />);

    const labels = within(screen.getByRole("navigation")).getAllByRole("link").map((a) => a.textContent);
    expect(labels).toEqual([
      "Home",
      "Char Dham Yatra",
      "Aircraft Handling Service",
      "Trekking",
      "Farm Stay / Wellness Centre",
      "About Us",
      "Contact",
    ]);
    expect(screen.queryByRole("link", { name: "Devrana" })).not.toBeInTheDocument();
  });

  it("points the yatra and handling items at their pages", () => {
    render(<Header settings={settings} />);

    expect(screen.getByRole("link", { name: "Char Dham Yatra" })).toHaveAttribute("href", "/yatra");
    expect(screen.getByRole("link", { name: "Aircraft Handling Service" })).toHaveAttribute(
      "href",
      "/yatra/yamunotri-gangotri-handling"
    );
  });

  it("uses a coloured gradient bar", () => {
    render(<Header settings={settings} />);

    expect(screen.getByRole("banner")).toHaveClass("bg-gradient-to-r");
  });
});
