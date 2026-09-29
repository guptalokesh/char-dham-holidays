import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendMail } from "@/lib/email/send";

describe("sendMail", () => {
  const originalHost = process.env.SMTP_HOST;

  beforeEach(() => {
    delete process.env.SMTP_HOST;
  });

  afterEach(() => {
    if (originalHost) process.env.SMTP_HOST = originalHost;
    vi.restoreAllMocks();
  });

  it("does not throw and warns when SMTP is not configured", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await sendMail({
      to: "customer@example.com",
      subject: "Test",
      text: "Hello",
      html: "<p>Hello</p>",
    });

    expect(result.skipped).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });
});
