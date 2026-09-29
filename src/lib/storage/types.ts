export interface SavedFile {
  url: string;
  size: number;
}

export interface StorageDriver {
  save(buffer: Buffer, filename: string, mimeType: string): Promise<SavedFile>;
  delete(url: string): Promise<void>;
}
