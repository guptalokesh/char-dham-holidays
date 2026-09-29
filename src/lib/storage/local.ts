import fs from "node:fs/promises";
import path from "node:path";
import type { SavedFile, StorageDriver } from "@/lib/storage/types";

const SAFE_FILENAME = /^[A-Za-z0-9._-]+$/;

export class LocalStorageDriver implements StorageDriver {
  constructor(
    private readonly baseDir: string,
    private readonly urlPrefix: string = "/uploads"
  ) {}

  async save(buffer: Buffer, filename: string, _mimeType: string): Promise<SavedFile> {
    if (!SAFE_FILENAME.test(filename)) {
      throw new Error(`Refusing to write unsafe filename: ${filename}`);
    }

    await fs.mkdir(this.baseDir, { recursive: true });
    const filePath = path.join(this.baseDir, filename);
    await fs.writeFile(filePath, buffer);

    return { url: `${this.urlPrefix}/${filename}`, size: buffer.length };
  }

  async delete(url: string): Promise<void> {
    const filename = path.basename(url);
    const filePath = path.join(this.baseDir, filename);
    await fs.rm(filePath, { force: true });
  }
}
