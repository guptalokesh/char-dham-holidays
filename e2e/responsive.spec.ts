import { expect, test } from "@playwright/test";

// Breakpoint sweep required by the spec: no horizontal scroll at any of
// these widths on the main public pages.
const VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1280, 1440];

const PAGES = ["/", "/chardham", "/trekking", "/trekking/devrana-trek", "/farm-home-stay", "/contact", "/about"];

test.describe("responsive layout — no horizontal overflow at any breakpoint", () => {
  for (const width of VIEWPORTS) {
    for (const path of PAGES) {
      test(`${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(
          scrollWidth,
          `${path} at ${width}px: document is ${scrollWidth}px wide but the viewport is only ${clientWidth}px (horizontal scroll)`
        ).toBeLessThanOrEqual(clientWidth);
      });
    }
  }

  test("mobile nav toggle is visible and the desktop nav is hidden below 640px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    // Scoped to the header: the footer's own nav (always visible, by
    // design — it's a simple stacked list, not the hamburger-toggled one)
    // has an identical "Chardham" link that would otherwise make this
    // assertion pass regardless of the header's responsive behavior.
    const header = page.getByRole("banner");
    await expect(header.getByRole("button", { name: /menu/i })).toBeVisible();
    await expect(header.getByRole("link", { name: "Chardham", exact: true })).not.toBeVisible();

    await header.getByRole("button", { name: /menu/i }).click();
    await expect(header.getByRole("link", { name: "Chardham", exact: true })).toBeVisible();
  });
});
