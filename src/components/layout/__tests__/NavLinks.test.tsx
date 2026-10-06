import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLinks } from "@/components/layout/NavLinks";

let pathname = "/trekking/devrana-trek";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const links = [
  { href: "/", label: "Home" },
  { href: "/yatra", label: "Char Dham Yatra", accent: true },
  { href: "/trekking", label: "Trekking" },
];

describe("NavLinks", () => {
  it("marks only the current section as the current page", () => {
    pathname = "/trekking/devrana-trek";
    render(<NavLinks links={links} />);

    expect(screen.getByRole("link", { name: "Trekking" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Char Dham Yatra" })).not.toHaveAttribute("aria-current");
  });

  it("styles the accent link differently from the rest", () => {
    pathname = "/";
    render(<NavLinks links={links} />);

    expect(screen.getByRole("link", { name: "Char Dham Yatra" })).toHaveClass("bg-amber-500");
    expect(screen.getByRole("link", { name: "Trekking" })).not.toHaveClass("bg-amber-500");
  });
});
