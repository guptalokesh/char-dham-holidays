import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OfferPopup } from "@/components/layout/OfferPopup";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function renderPopup() {
  return render(<OfferPopup charDhamPrice={210000} anyDhamPrice={null} delayMs={3000} />);
}

describe("OfferPopup", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    sessionStorage.clear();
    pathname = "/";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays hidden at first, then opens after the delay with the season and both prices", () => {
    renderPopup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent(/April – June & September – October/);
    expect(dialog).toHaveTextContent(/pick-up in Dehradun/);
    expect(dialog).toHaveTextContent("Char Dham Yatra");
    expect(dialog).toHaveTextContent("₹2,10,000");
    expect(dialog).toHaveTextContent("Any Dham Yatra");
    expect(dialog).toHaveTextContent("Price on request");
  });

  it("links to the Char Dham yatra and to all yatras", () => {
    renderPopup();
    act(() => vi.advanceTimersByTime(3000));

    expect(screen.getByRole("link", { name: "Book now" })).toHaveAttribute("href", "/yatra/char-dham");
    expect(screen.getByRole("link", { name: "View packages" })).toHaveAttribute("href", "/yatra");
  });

  it("closes with the close button and then does not return in the same session", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const first = renderPopup();
    act(() => vi.advanceTimersByTime(3000));

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    first.unmount();
    renderPopup();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes with the Escape key", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPopup();
    act(() => vi.advanceTimersByTime(3000));

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus into the dialog when it opens", () => {
    renderPopup();
    act(() => vi.advanceTimersByTime(3000));

    expect(screen.getByRole("button", { name: /close/i })).toHaveFocus();
  });

  it.each(["/yatra", "/yatra/char-dham", "/contact"])("does not open on %s", (path) => {
    pathname = path;
    renderPopup();
    act(() => vi.advanceTimersByTime(5000));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
