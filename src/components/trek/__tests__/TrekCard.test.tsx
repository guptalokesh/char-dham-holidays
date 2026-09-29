import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrekCard } from "@/components/trek/TrekCard";

describe("TrekCard", () => {
  it("links to the trek's detail page and shows its name", () => {
    render(
      <TrekCard
        trek={{
          slug: "devrana-trek",
          name: "Devrana Trek",
          description: "A customised trekking experience.",
          price: null,
          images: [],
        }}
      />
    );

    const link = screen.getByRole("link", { name: /devrana trek/i });
    expect(link).toHaveAttribute("href", "/trekking/devrana-trek");
    expect(screen.getByText(/customised service/i)).toBeInTheDocument();
  });

  it("shows a formatted price when one is set", () => {
    render(
      <TrekCard
        trek={{
          slug: "priced-trek",
          name: "Priced Trek",
          description: "desc",
          price: 5000,
          images: [],
        }}
      />
    );

    expect(screen.getByText(/₹5,000/)).toBeInTheDocument();
  });
});
