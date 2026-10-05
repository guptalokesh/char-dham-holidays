import { describe, expect, it } from "vitest";
import {
  buildChardhamWhatsAppMessage,
  buildFarmHomeStayWhatsAppMessage,
  buildTrekWhatsAppMessage,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from "@/lib/whatsapp";

describe("normalizePhoneForWhatsApp", () => {
  it("strips spaces, dashes, parentheses and the leading +", () => {
    expect(normalizePhoneForWhatsApp("+91 98765-43210")).toBe("919876543210");
    expect(normalizePhoneForWhatsApp("(91) 98765 43210")).toBe("919876543210");
  });

  it("throws when no digits remain", () => {
    expect(() => normalizePhoneForWhatsApp("")).toThrow();
    expect(() => normalizePhoneForWhatsApp("+  -()")).toThrow();
  });
});

describe("buildChardhamWhatsAppMessage", () => {
  it("names the package and lists the date and number of travellers", () => {
    const message = buildChardhamWhatsAppMessage({
      packageName: "Char Dham Yatra by Helicopter",
      preferredDate: "2026-11-10",
      travellers: 4,
    });

    expect(message).toBe(
      "Hello, I am interested in Char Dham Yatra by Helicopter.\n\n" +
        "Preferred date: 2026-11-10\n" +
        "Number of travellers: 4\n\n" +
        "Please confirm availability and booking details."
    );
  });

  it("lists the chosen dhams when there are any", () => {
    const message = buildChardhamWhatsAppMessage({
      packageName: "Any Dham Yatra by Helicopter",
      preferredDate: "2026-11-10",
      travellers: 2,
      dhams: ["Kedarnath", "Badrinath"],
    });

    expect(message).toContain("Hello, I am interested in Any Dham Yatra by Helicopter.");
    expect(message).toContain("Dhams: Kedarnath, Badrinath\n");
  });
});

describe("buildTrekWhatsAppMessage", () => {
  it("matches the exact format from the spec", () => {
    const message = buildTrekWhatsAppMessage({
      trekName: "Devrana Trek",
      people: 2,
      preferredDate: "2026-12-01",
      requirements: "Vegetarian food only",
    });

    expect(message).toBe(
      "Hello, I am interested in Devrana Trek.\n\n" +
        "Number of people: 2\n" +
        "Preferred date: 2026-12-01\n" +
        "Additional requirements: Vegetarian food only\n\n" +
        "Please share availability and pricing."
    );
  });

  it("shows 'None' when no additional requirements are given", () => {
    const message = buildTrekWhatsAppMessage({
      trekName: "Rupnyol Bugyal Trek",
      people: 3,
      preferredDate: "2026-12-05",
      requirements: "",
    });

    expect(message).toContain("Additional requirements: None");
  });
});

describe("buildFarmHomeStayWhatsAppMessage", () => {
  it("matches the exact format from the spec", () => {
    const message = buildFarmHomeStayWhatsAppMessage({
      roomName: "Deluxe Room",
      checkIn: "2026-10-20",
      checkOut: "2026-10-22",
      guests: 2,
    });

    expect(message).toBe(
      "Hello, I would like to book the Farm Home Stay.\n\n" +
        "Room: Deluxe Room\n" +
        "Check-in: 2026-10-20\n" +
        "Check-out: 2026-10-22\n" +
        "Guests: 2\n\n" +
        "Please confirm availability and booking details."
    );
  });
});

describe("buildWhatsAppUrl", () => {
  it("builds a wa.me URL with the message safely encoded", () => {
    const url = buildWhatsAppUrl("+91 98765 43210", "Hello there");
    expect(url).toBe("https://wa.me/919876543210?text=Hello%20there");
  });

  it("round-trips special characters (&, =, newlines) safely", () => {
    const message = "Line one\nLine two & more = stuff?";
    const url = buildWhatsAppUrl("+919876543210", message);

    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/919876543210");
    expect(parsed.searchParams.get("text")).toBe(message);
  });

  it("throws when the phone number has no usable digits", () => {
    expect(() => buildWhatsAppUrl("", "hi")).toThrow();
  });
});
