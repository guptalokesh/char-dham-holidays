import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorageDriver } from "@/lib/storage/local";

describe("LocalStorageDriver", () => {
  let tempDir: string;
  let driver: LocalStorageDriver;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "chardham-storage-"));
    driver = new LocalStorageDriver(tempDir, "/uploads");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("writes the file to disk and returns its public url and size", async () => {
    const buffer = Buffer.from("hello world");
    const result = await driver.save(buffer, "abc123.jpg", "image/jpeg");

    expect(result.url).toBe("/uploads/abc123.jpg");
    expect(result.size).toBe(buffer.length);

    const written = await fs.readFile(path.join(tempDir, "abc123.jpg"));
    expect(written.equals(buffer)).toBe(true);
  });

  it("deletes a previously saved file", async () => {
    await driver.save(Buffer.from("data"), "todelete.pdf", "application/pdf");
    await driver.delete("/uploads/todelete.pdf");

    await expect(fs.readFile(path.join(tempDir, "todelete.pdf"))).rejects.toThrow();
  });

  it("does not throw when deleting a file that does not exist", async () => {
    await expect(driver.delete("/uploads/never-existed.pdf")).resolves.not.toThrow();
  });

  it("rejects a filename containing path traversal segments", async () => {
    await expect(
      driver.save(Buffer.from("x"), "../../evil.jpg", "image/jpeg")
    ).rejects.toThrow();
  });

  it("rejects a filename containing a path separator", async () => {
    await expect(
      driver.save(Buffer.from("x"), "sub/dir/evil.jpg", "image/jpeg")
    ).rejects.toThrow();
  });
});
