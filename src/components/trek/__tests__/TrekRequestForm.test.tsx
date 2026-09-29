import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrekRequestForm } from "@/components/trek/TrekRequestForm";

function futureDateInput(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), "Kunal Mehta");
  await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
  await user.type(screen.getByLabelText(/preferred date/i), futureDateInput(15));
  await user.clear(screen.getByLabelText(/number of people/i));
  await user.type(screen.getByLabelText(/number of people/i), "3");
}

describe("TrekRequestForm", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts to the trek-specific request endpoint and opens WhatsApp", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ whatsappUrl: "https://wa.me/919000000000?text=hi" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<TrekRequestForm trekSlug="devrana-trek" />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /request/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/trek/devrana-trek/request",
      expect.objectContaining({ method: "POST" })
    );
    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith(
        "https://wa.me/919000000000?text=hi",
        "_blank",
        "noopener,noreferrer"
      )
    );
  });

  it("rejects a past preferred date without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<TrekRequestForm trekSlug="devrana-trek" />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText(/preferred date/i));
    await user.type(screen.getByLabelText(/preferred date/i), futureDateInput(-2));
    await user.click(screen.getByRole("button", { name: /request/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/past/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
