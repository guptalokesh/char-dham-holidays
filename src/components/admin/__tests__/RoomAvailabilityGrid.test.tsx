import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoomAvailabilityGrid } from "@/components/admin/RoomAvailabilityGrid";

const initial = [
  {
    id: "room-1",
    name: "Deluxe Room",
    active: true,
    days: [{ date: "2026-10-20", status: "AVAILABLE" as const }],
  },
];

describe("RoomAvailabilityGrid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("cycles the status and PATCHes the new value optimistically", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<RoomAvailabilityGrid initial={initial} />);
    const cell = screen.getByRole("button", { name: /avai/i });
    await user.click(cell);

    expect(screen.getByRole("button", { name: /book/i })).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/farm/rooms/room-1/availability",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      dates: ["2026-10-20"],
      status: "BOOKED",
    });
  });

  it("reverts the cell and shows an error when the update fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ error: "Server error." }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<RoomAvailabilityGrid initial={initial} />);
    await user.click(screen.getByRole("button", { name: /avai/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/server error/i);
    expect(screen.getByRole("button", { name: /avai/i })).toBeInTheDocument();
  });
});
