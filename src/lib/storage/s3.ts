import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import type { SavedFile, StorageDriver } from "@/lib/storage/types";

export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    private readonly publicUrlBase: string,
    clientConfig: S3ClientConfig
  ) {
    this.client = new S3Client(clientConfig);
  }

  async save(buffer: Buffer, filename: string, mimeType: string): Promise<SavedFile> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return {
      url: `${this.publicUrlBase.replace(/\/$/, "")}/${filename}`,
      size: buffer.length,
    };
  }

  async delete(url: string): Promise<void> {
    const key = url.split("/").pop();
    if (!key) return;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
