import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { EnquiriesTable } from "@/components/admin/EnquiriesTable";

const base = {
  id: "e1",
  name: "Anita Rao",
  phone: "+91 98765 43210",
  email: null,
  service: "CHARDHAM",
  message: null,
  status: "NEW" as const,
  createdAt: new Date("2026-10-05T10:00:00Z"),
  trek: null,
  room: null,
};

describe("EnquiriesTable", () => {
  it("shows which yatra a Char Dham enquiry is for", () => {
    render(
      <EnquiriesTable enquiries={[{ ...base, chardhamPackage: { name: "Any Dham Yatra by Helicopter" } }]} />
    );

    expect(screen.getByText("Any Dham Yatra by Helicopter")).toBeInTheDocument();
  });

  it("falls back to the service name for older enquiries without a package", () => {
    render(<EnquiriesTable enquiries={[base]} />);

    expect(screen.getByText("CHARDHAM")).toBeInTheDocument();
  });
});
