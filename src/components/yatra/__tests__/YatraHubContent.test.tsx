import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YatraHubContent } from "@/components/yatra/YatraHubContent";

const yatras = [
  { slug: "char-dham", name: "Char Dham Yatra by Helicopter", tagline: "All four dhams", price: 21000, images: [{ url: "/seed-images/chardham.jpg" }] },
  { slug: "any-dham", name: "Any Dham Yatra by Helicopter", tagline: "Visit the dham you wish", price: null, images: [] },
];

describe("YatraHubContent", () => {
  it("shows a card per yatra linking to its page, with its price", () => {
    render(<YatraHubContent yatras={yatras} />);

    expect(screen.getByRole("link", { name: /char dham yatra by helicopter/i })).toHaveAttribute("href", "/yatra/char-dham");
    expect(screen.getByRole("link", { name: /any dham yatra by helicopter/i })).toHaveAttribute("href", "/yatra/any-dham");
    expect(screen.getByText(/₹21,000/)).toBeInTheDocument();
    expect(screen.getByText("Price on request")).toBeInTheDocument();
  });

  it("shows a friendly message when no yatra is available", () => {
    render(<YatraHubContent yatras={[]} />);

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
