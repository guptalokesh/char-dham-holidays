import path from "node:path";
import { LocalStorageDriver } from "@/lib/storage/local";
import { S3StorageDriver } from "@/lib/storage/s3";
import type { StorageDriver } from "@/lib/storage/types";

export type { StorageDriver } from "@/lib/storage/types";

let cached: StorageDriver | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set when STORAGE_DRIVER=s3`);
  }
  return value;
}

function buildDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "s3") {
    return new S3StorageDriver(requireEnv("S3_BUCKET"), requireEnv("S3_PUBLIC_URL"), {
      region: requireEnv("S3_REGION"),
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
    });
  }

  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), "public/uploads");

  return new LocalStorageDriver(uploadDir, "/uploads");
}

export function getStorageDriver(): StorageDriver {
  if (!cached) {
    cached = buildDriver();
  }
  return cached;
}

/** Test-only: forces the next getStorageDriver() call to rebuild the driver. */
export function __resetStorageDriverForTests(): void {
  cached = undefined;
}
