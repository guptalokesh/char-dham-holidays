import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutIntro } from "@/components/contact/AboutIntro";

describe("AboutIntro", () => {
  it("is the anchored About section with the business name and short description", () => {
    const { container } = render(
      <AboutIntro businessName="Char Dham Holidays" shortDescription="Yatras and treks in Uttarakhand." />
    );

    expect(container.querySelector("section#about")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "About Char Dham Holidays" })).toBeInTheDocument();
    expect(screen.getByText("Yatras and treks in Uttarakhand.")).toBeInTheDocument();
    expect(screen.getByText(/helicopter yatras to the Char Dham/i)).toBeInTheDocument();
  });

  it("leaves out the short description when it is not set", () => {
    render(<AboutIntro businessName="Char Dham Holidays" shortDescription={null} />);

    expect(screen.getByRole("heading", { name: "About Char Dham Holidays" })).toBeInTheDocument();
  });
});
