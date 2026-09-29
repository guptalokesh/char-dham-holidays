import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

const EMAILS_DIR = "/tmp/e2e-emails";

/** Stubs window.open before any page script runs, recording each call. */
export async function interceptWhatsApp(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __whatsappCalls: string[] }).__whatsappCalls = [];
    window.open = (url?: string | URL) => {
      (window as unknown as { __whatsappCalls: string[] }).__whatsappCalls.push(
        String(url ?? "")
      );
      return null;
    };
  });
}

export async function getWhatsAppCalls(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { __whatsappCalls?: string[] }).__whatsappCalls ?? []
  );
}

interface CapturedEmail {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  receivedAt: string;
}

/** Polls the fake SMTP server's output directory for an email to the given address. */
export async function waitForEmailTo(
  address: string,
  options: { timeoutMs?: number; subjectContains?: string } = {}
): Promise<CapturedEmail> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const files = fs.existsSync(EMAILS_DIR) ? fs.readdirSync(EMAILS_DIR) : [];
    for (const file of files) {
      const record: CapturedEmail = JSON.parse(
        fs.readFileSync(path.join(EMAILS_DIR, file), "utf-8")
      );
      if (
        record.to.includes(address) &&
        (!options.subjectContains || record.subject.includes(options.subjectContains))
      ) {
        return record;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for an email to ${address}`);
}

export async function adminLogin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL ?? "admin@chardhamholidays.example");
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "E2ePassword123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/admin/dashboard");
}

export function minimalPdfBuffer(): Buffer {
  return Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF"
  );
}
