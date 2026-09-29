import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeHeaderValue } from "@/lib/email/sanitize";

describe("sanitizeHeaderValue", () => {
  it("strips CR and LF characters that could inject extra headers", () => {
    const malicious = "Evil\r\nBcc: attacker@evil.example\r\nSubject: pwned";
    const result = sanitizeHeaderValue(malicious);

    expect(result).not.toContain("\r");
    expect(result).not.toContain("\n");
    expect(result).toContain("Bcc: attacker@evil.example");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeHeaderValue("  hello  ")).toBe("hello");
  });
});

describe("escapeHtml", () => {
  it("escapes script tags and other HTML-significant characters", () => {
    const malicious = `<script>alert('xss')</script> & "quoted"`;
    const result = escapeHtml(malicious);

    expect(result).not.toContain("<script>");
    expect(result).toBe(
      "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt; &amp; &quot;quoted&quot;"
    );
  });
});
