import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MobileNav } from "@/components/layout/MobileNav";

const links = [
  { href: "/chardham", label: "Chardham" },
  { href: "/trekking", label: "Trekking" },
];

describe("MobileNav", () => {
  it("is collapsed by default and expands when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav links={links} />);

    const toggle = screen.getByRole("button", { name: /menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Chardham" })).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Chardham" })).toBeInTheDocument();
  });

  it("collapses again when the toggle is clicked a second time", async () => {
    const user = userEvent.setup();
    render(<MobileNav links={links} />);

    const toggle = screen.getByRole("button", { name: /menu/i });
    await user.click(toggle);
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Chardham" })).not.toBeInTheDocument();
  });

  it("shows the primary CTA in the expanded panel when provided (mobile must not lose it)", async () => {
    const user = userEvent.setup();
    render(<MobileNav links={links} cta={{ href: "/contact", label: "Check Availability" }} />);

    await user.click(screen.getByRole("button", { name: /menu/i }));

    const cta = screen.getByRole("link", { name: "Check Availability" });
    expect(cta).toHaveAttribute("href", "/contact");
  });
});
