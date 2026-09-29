import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FarmAvailabilitySearch } from "@/components/farm/FarmAvailabilitySearch";

function futureDateInput(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function fillSearchForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/check-in/i), futureDateInput(10));
  await user.type(screen.getByLabelText(/check-out/i), futureDateInput(12));
  await user.clear(screen.getByLabelText(/guests/i));
  await user.type(screen.getByLabelText(/guests/i), "2");
}

describe("FarmAvailabilitySearch", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects checkout on/before checkin without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FarmAvailabilitySearch />);
    await user.type(screen.getByLabelText(/check-in/i), futureDateInput(10));
    await user.type(screen.getByLabelText(/check-out/i), futureDateInput(10));
    await user.clear(screen.getByLabelText(/guests/i));
    await user.type(screen.getByLabelText(/guests/i), "2");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/after check-in/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows available rooms returned by the search", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rooms: [
          { id: "room-1", name: "Deluxe Room", price: 3500, capacity: 2, images: [] },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FarmAvailabilitySearch />);
    await fillSearchForm(user);
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByText("Deluxe Room")).toBeInTheDocument();
    expect(screen.getByText(/₹3,500/)).toBeInTheDocument();
  });

  it("shows a no-availability message when the search returns no rooms", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rooms: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FarmAvailabilitySearch />);
    await fillSearchForm(user);
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByText(/no rooms available/i)).toBeInTheDocument();
  });

  it("books a room: shows contact fields, submits, and opens WhatsApp", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/farm/search") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            rooms: [{ id: "room-1", name: "Deluxe Room", price: 3500, capacity: 2, images: [] }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ whatsappUrl: "https://wa.me/919000000000?text=hi" }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FarmAvailabilitySearch />);
    await fillSearchForm(user);
    await user.click(screen.getByRole("button", { name: /search/i }));
    await screen.findByText("Deluxe Room");

    await user.click(screen.getByRole("button", { name: /book now/i }));
    await user.type(screen.getByLabelText(/name/i), "Sana Iqbal");
    await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
    await user.click(screen.getByRole("button", { name: /request booking/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/farm/booking",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith(
        "https://wa.me/919000000000?text=hi",
        "_blank",
        "noopener,noreferrer"
      )
    );
  });
});
