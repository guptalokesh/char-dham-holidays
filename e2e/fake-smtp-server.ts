import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";

const PORT = Number(process.env.FAKE_SMTP_PORT ?? 2525);
const OUTPUT_DIR = process.env.FAKE_SMTP_OUTPUT_DIR ?? "/tmp/e2e-emails";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
for (const file of fs.readdirSync(OUTPUT_DIR)) {
  fs.rmSync(path.join(OUTPUT_DIR, file));
}

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  async onData(stream, _session, callback) {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", async () => {
      try {
        const parsed = await simpleParser(Buffer.concat(chunks));
        const record = {
          to: parsed.to
            ? Array.isArray(parsed.to)
              ? parsed.to.map((a) => a.text).join(", ")
              : parsed.to.text
            : "",
          from: parsed.from?.text ?? "",
          subject: parsed.subject ?? "",
          text: parsed.text ?? "",
          html: typeof parsed.html === "string" ? parsed.html : "",
          receivedAt: new Date().toISOString(),
        };
        const filename = `${Date.now()}-${crypto.randomUUID()}.json`;
        fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(record, null, 2));
      } catch (error) {
        console.error("fake-smtp-server: failed to parse email", error);
      }
      callback();
    });
  },
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`fake-smtp-server listening on 127.0.0.1:${PORT}, writing to ${OUTPUT_DIR}`);
});
