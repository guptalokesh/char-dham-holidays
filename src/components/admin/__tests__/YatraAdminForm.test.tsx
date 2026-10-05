import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YatraAdminForm } from "@/components/admin/YatraAdminForm";

const initial = {
  id: "pkg-1",
  slug: "char-dham",
  name: "Char Dham Yatra by Helicopter",
  tagline: "All four dhams",
  price: 21000 as number | null,
  routeOverview: "Overview",
  startPoint: "Dehradun",
  howItStarts: "We meet you.",
  inclusions: ["Helicopter flights", "Hotel stays"],
  importantInfo: "Weather note.\nSpare days.",
  stayInfo: "Included",
  foodInfo: "",
  travelInfo: "",
  active: true,
  steps: [
    { title: "Arrive", description: "Briefing", featured: false },
    { title: "Kedarnath", description: "Darshan", featured: true, imageUrl: "/seed-images/k.jpg" },
  ],
  images: [] as { id: string; url: string }[],
  itineraryMedia: null as { id: string; url: string } | null,
};

function mockSave(response: unknown = { ok: true, json: async () => ({ chardhamPackage: initial, message: "Saved" }) }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("YatraAdminForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("saves every field to the package endpoint, one inclusion and note per line", async () => {
    const fetchMock = mockSave();
    const user = userEvent.setup();
    render(<YatraAdminForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/packages/pkg-1");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toMatchObject({
      name: "Char Dham Yatra by Helicopter",
      tagline: "All four dhams",
      price: 21000,
      startPoint: "Dehradun",
      inclusions: ["Helicopter flights", "Hotel stays"],
      importantInfo: "Weather note.\nSpare days.",
      active: true,
      steps: [
        { title: "Arrive", description: "Briefing", featured: false },
        { title: "Kedarnath", description: "Darshan", featured: true, imageUrl: "/seed-images/k.jpg" },
      ],
    });
  });

  it("sends a null price when the price box is emptied (price on request)", async () => {
    const fetchMock = mockSave();
    const user = userEvent.setup();
    render(<YatraAdminForm initial={initial} />);

    await user.clear(screen.getByLabelText(/price/i));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).price).toBeNull();
  });

  it("adds, edits, reorders and removes journey steps", async () => {
    const fetchMock = mockSave();
    const user = userEvent.setup();
    render(<YatraAdminForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: /add step/i }));
    const titles = screen.getAllByLabelText(/step title/i);
    expect(titles).toHaveLength(3);
    await user.type(titles[2], "Return home");

    // move "Return home" to the top, then remove "Arrive"
    await user.click(screen.getAllByRole("button", { name: /move up/i })[2]);
    await user.click(screen.getAllByRole("button", { name: /move up/i })[1]);
    await user.click(screen.getAllByRole("button", { name: /remove step/i })[1]);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const steps = JSON.parse(fetchMock.mock.calls[0][1].body).steps;
    expect(steps.map((s: { title: string }) => s.title)).toEqual(["Return home", "Kedarnath"]);
  });

  it("toggles a step as a dham", async () => {
    const fetchMock = mockSave();
    const user = userEvent.setup();
    render(<YatraAdminForm initial={initial} />);

    await user.click(screen.getAllByLabelText(/this step is a dham/i)[0]);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const steps = JSON.parse(fetchMock.mock.calls[0][1].body).steps;
    expect(steps[0].featured).toBe(true);
  });

  it("shows the server's error message", async () => {
    mockSave({ ok: false, json: async () => ({ error: "Invalid package data." }) });
    const user = userEvent.setup();
    render(<YatraAdminForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid package data.");
  });

  it("explains that an empty price means price on request", () => {
    render(<YatraAdminForm initial={initial} />);

    expect(within(screen.getByLabelText(/price/i).parentElement!).getByText(/price on request/i)).toBeInTheDocument();
  });
});
