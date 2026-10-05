import { expect, test } from "@playwright/test";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import {
  adminLogin,
  getWhatsAppCalls,
  interceptWhatsApp,
  minimalPdfBuffer,
  waitForEmailTo,
} from "./helpers";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

test.describe.serial("Char Dham Holidays — end-to-end acceptance flows (spec section 56)", () => {
  test("TEST 1 — Char Dham: homepage -> Char Dham yatra page -> availability -> WhatsApp message", async ({
    page,
  }) => {
    await interceptWhatsApp(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Explore Char Dham" }).click();
    await expect(page).toHaveURL(/\/yatra\/char-dham$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Char Dham Yatra by Helicopter"
    );

    await page.getByLabel("Name").fill("Anita Rao");
    await page.getByLabel("Phone").fill("+91 98765 43210");
    await page.getByLabel("Preferred date").fill(futureDate(20));
    const travellers = page.getByLabel("Number of travellers");
    await travellers.fill("3");
    await page.getByRole("button", { name: "Check Availability" }).click();

    await expect(page.getByText(/we've received your request/i)).toBeVisible();

    const calls = await getWhatsAppCalls(page);
    expect(calls).toHaveLength(1);
    const url = new URL(calls[0]);
    expect(url.hostname).toBe("wa.me");
    const message = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(message).toBe(
      "Hello, I am interested in Char Dham Yatra by Helicopter.\n\n" +
        `Preferred date: ${futureDate(20)}\n` +
        "Number of travellers: 3\n\n" +
        "Please confirm availability and booking details."
    );
  });

  test("TEST 2 — Trekking: trekking -> Devrana -> request -> WhatsApp message", async ({
    page,
  }) => {
    await interceptWhatsApp(page);
    await page.goto("/trekking");
    await page.getByRole("link", { name: /devrana trek/i }).click();
    await expect(page).toHaveURL(/\/trekking\/devrana-trek$/);

    await page.getByLabel("Name").fill("Kunal Mehta");
    await page.getByLabel("Phone").fill("+91 98765 43210");
    await page.getByLabel("Number of people").fill("4");
    await page.getByLabel("Preferred date").fill(futureDate(30));
    await page
      .getByLabel(/additional requirements/i)
      .fill("Vegetarian meals please");
    await page.getByRole("button", { name: /request availability/i }).click();
    await expect(page.getByText(/we've received your request/i)).toBeVisible();

    const calls = await getWhatsAppCalls(page);
    expect(calls).toHaveLength(1);
    const message = decodeURIComponent(new URL(calls[0]).searchParams.get("text") ?? "");
    expect(message).toBe(
      "Hello, I am interested in Devrana Trek.\n\n" +
        "Number of people: 4\n" +
        `Preferred date: ${futureDate(30)}\n` +
        "Additional requirements: Vegetarian meals please\n\n" +
        "Please share availability and pricing."
    );
  });

  test("TEST 3 — Farm Home Stay: search -> select room -> book -> WhatsApp message", async ({
    page,
  }) => {
    await interceptWhatsApp(page);
    await page.goto("/farm-home-stay");

    const checkIn = futureDate(10);
    const checkOut = futureDate(12);
    await page.getByLabel("Check-in").fill(checkIn);
    await page.getByLabel("Check-out").fill(checkOut);
    await page.getByLabel("Guests").fill("2");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    const searchResults = page.getByTestId("farm-search-results");
    await expect(searchResults.getByText("Deluxe Room")).toBeVisible();

    const deluxeCard = searchResults
      .locator("div.rounded-lg.border")
      .filter({ hasText: "Deluxe Room" });
    await deluxeCard.getByRole("button", { name: /book now/i }).click();
    await page.getByLabel("Name").fill("Sana Iqbal");
    await page.getByLabel("Phone").fill("+91 98765 43210");
    await page.getByRole("button", { name: /request booking/i }).click();

    await expect(page.getByText(/we've received your request/i)).toBeVisible();

    const calls = await getWhatsAppCalls(page);
    expect(calls).toHaveLength(1);
    const message = decodeURIComponent(new URL(calls[0]).searchParams.get("text") ?? "");
    expect(message).toBe(
      "Hello, I would like to book the Farm Home Stay.\n\n" +
        "Room: Deluxe Room\n" +
        `Check-in: ${checkIn}\n` +
        `Check-out: ${checkOut}\n` +
        "Guests: 2\n\n" +
        "Please confirm availability and booking details."
    );
  });

  test("TEST 4 — General enquiry: form -> validation -> DB -> organiser + acknowledgement email", async ({
    page,
  }) => {
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Meera Nair");
    await page.getByLabel("Phone").fill("+91 98765 43210");
    await page.getByLabel("Email").fill("meera.e2e@example.com");
    await page.getByLabel("Message").fill("I would like to know more about your packages.");
    await page.getByRole("button", { name: /send enquiry/i }).click();

    await expect(page.getByText(/we've received your enquiry/i)).toBeVisible();

    const organiserEmail = await waitForEmailTo("hello@chardhamholidays.example", {
      subjectContains: "New enquiry",
    });
    expect(organiserEmail.text).toContain("Meera Nair");
    expect(organiserEmail.text).toContain("meera.e2e@example.com");

    const ackEmail = await waitForEmailTo("meera.e2e@example.com", {
      subjectContains: "received your enquiry",
    });
    expect(ackEmail.text).toContain("Meera Nair");
    expect(ackEmail.text.toLowerCase()).not.toContain("confirmed");
  });

  test("TEST 5 — Admin settings: change WhatsApp number -> propagates to public WhatsApp CTAs", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/settings");

    const newNumber = "+91 90000 11111";
    await page.getByLabel("WhatsApp number").fill(newNumber);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/settings saved successfully/i)).toBeVisible();

    await page.goto("/");
    // This CTA is a plain <a target="_blank"> (a static wa.me link, unlike
    // the form flows above which build the URL via window.open() after an
    // API call), so we assert on its href directly rather than intercepting
    // a click that would otherwise open a real new tab.
    const href = await page
      .getByRole("link", { name: "Chat on WhatsApp" })
      .first()
      .getAttribute("href");
    expect(href).toContain("wa.me/919000011111");
  });

  test("TEST 6 — Admin: change room price -> new price appears on public Farm Home Stay page", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/listings/farm");

    await page.getByLabel("Price (₹/night)").first().fill("4444");
    await page.getByRole("button", { name: "Save", exact: true }).first().click();
    await expect(page.getByText(/room updated successfully/i)).toBeVisible();

    await page.goto("/farm-home-stay");
    await expect(page.getByText("₹4,444")).toBeVisible();
  });

  test("TEST 7 — Admin: mark room unavailable -> excluded from a matching public search", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/availability-enquiries");

    const targetDate = futureDate(3);
    const cell = page.getByRole("button", { name: new RegExp(`Deluxe Room, ${targetDate}`, "i") });
    await expect(cell).toHaveText(/avai/i);

    // The grid updates optimistically before the PATCH resolves, so
    // asserting on the button's text alone would pass even if the request
    // later fails and reverts — wait for the actual network response.
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/availability") && res.request().method() === "PATCH"),
      cell.click(),
    ]);
    expect(response.ok()).toBe(true);
    await expect(cell).toHaveText(/book/i);

    await page.goto("/farm-home-stay");
    await page.getByLabel("Check-in").fill(targetDate);
    await page.getByLabel("Check-out").fill(futureDate(4));
    await page.getByLabel("Guests").fill("2");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    const searchResults = page.getByTestId("farm-search-results");
    await expect(searchResults.getByText("Farm View Cottage")).toBeVisible();
    await expect(searchResults.getByText("Deluxe Room")).not.toBeVisible();
  });

  test("TEST 8 — Admin: create a new trek -> appears on the public trekking page", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/listings/treks");

    const trekName = "Har Ki Dun Trek";
    await page.getByLabel("Name", { exact: true }).fill(trekName);
    await page
      .getByLabel("Description")
      .fill("A customised trek through the Har Ki Dun valley.");
    await page.getByRole("button", { name: /add trek/i }).click();
    await expect(page.getByText(trekName)).toBeVisible();

    await page.goto("/trekking");
    await expect(page.getByRole("link", { name: trekName })).toBeVisible();
  });

  test("TEST 9 — Admin: upload an itinerary PDF -> available on the public trek page", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/listings/treks");
    // Target the Devrana row specifically — TEST 8 created another trek with
    // the schema's default order (0), which would otherwise sort ahead of it
    // and make a plain "first Edit link" selector flaky/order-dependent.
    await page
      .locator("tr", { hasText: "Devrana Trek" })
      .getByRole("link", { name: "Edit" })
      .click();
    await expect(page).toHaveURL(/\/admin\/listings\/treks\/.+/);

    const pdfPath = path.join(os.tmpdir(), "e2e-itinerary.pdf");
    fs.writeFileSync(pdfPath, minimalPdfBuffer());
    await page.getByLabel(/upload itinerary pdf/i).setInputFiles(pdfPath);
    await expect(page.getByRole("link", { name: /view current itinerary/i })).toBeVisible();

    await page.goto("/trekking/devrana-trek");
    await expect(page.getByRole("link", { name: /view itinerary/i })).toBeVisible();
  });

  test("TEST 10 — Admin: change business details -> reflected in header/footer/contact", async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto("/admin/settings");

    const newPhone = "+91 98765 00000";
    const newEmail = "updated@chardhamholidays.example";
    const newAddress = "45 New Address Road";

    await page.getByLabel("Primary phone").fill(newPhone);
    await page.getByLabel("Primary email").fill(newEmail);
    await page.getByLabel("Address").fill(newAddress);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/settings saved successfully/i)).toBeVisible();

    await page.goto("/");
    await expect(page.getByText(newPhone)).toBeVisible();
    await expect(page.getByText(newEmail)).toBeVisible();

    await page.goto("/about");
    await expect(page.getByText(newAddress, { exact: false }).first()).toBeVisible();
  });

  test("TEST 11 — Any Dham: choose dhams -> request -> WhatsApp message lists them", async ({ page }) => {
    await interceptWhatsApp(page);
    await page.goto("/yatra/any-dham");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Any Dham Yatra by Helicopter");
    await expect(page.getByText("Price on request").first()).toBeVisible();

    await page.getByLabel("Name").fill("Ravi Kumar");
    await page.getByLabel("Phone").fill("+91 98765 43210");
    await page.getByLabel("Preferred date").fill(futureDate(25));
    await page.getByLabel("Number of travellers").fill("2");

    await page.getByRole("button", { name: "Check Availability" }).click();
    await expect(page.getByText(/please choose at least one dham/i)).toBeVisible();

    await page.getByLabel("Kedarnath").check();
    await page.getByLabel("Badrinath").check();
    await page.getByRole("button", { name: "Check Availability" }).click();
    await expect(page.getByText(/we've received your request/i)).toBeVisible();

    const calls = await getWhatsAppCalls(page);
    expect(calls).toHaveLength(1);
    const message = decodeURIComponent(new URL(calls[0]).searchParams.get("text") ?? "");
    expect(message).toContain("Hello, I am interested in Any Dham Yatra by Helicopter.");
    expect(message).toContain("Dhams: Kedarnath, Badrinath");
  });

  test("TEST 12 — Admin: set a yatra price -> shown on the public yatra page", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/listings/yatras");
    await page
      .locator("li", { hasText: "Any Dham Yatra by Helicopter" })
      .getByRole("link", { name: "Edit" })
      .click();

    await page.getByLabel(/price/i).fill("30000");
    const saved = page.waitForResponse(
      (response) => response.url().includes("/api/admin/packages/") && response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: /save changes/i }).click();
    expect((await saved).ok()).toBe(true);

    await page.goto("/yatra/any-dham");
    await expect(page.getByText(/₹30,000/).first()).toBeVisible();
  });
});
