import { unlink } from "fs/promises";
import { env } from "../env";
import {
  StorageError,
  UPLOAD_DIR,
  UploadOptions,
  UploadResult,
} from "../config/storage";
import { existsSync } from "fs";
import { join } from "path";
import {
  ensureDir,
  fetchBuffer,
  generateFilename,
  getAllowedForOption,
  getMaxSize,
  getMediaCategory,
} from "./helpers";

export const Storage = {
  async upload(
    file: File,
    bucket: string = "misc",
    opts: UploadOptions = {},
  ): Promise<UploadResult> {
    const allowed = getAllowedForOption(opts.accept ?? "all");

    if (!allowed.includes(file.type)) {
      const err: StorageError = { code: "INVALID_TYPE", allowed };
      throw err;
    }

    const maxSize = getMaxSize(file.type);
    if (file.size > maxSize) {
      const err: StorageError = { code: "FILE_TOO_LARGE", max: maxSize };
      throw err;
    }

    const bucketDir = join(UPLOAD_DIR, bucket);
    await ensureDir(bucketDir);

    const filename = generateFilename(file.name);
    const relativePath = `${bucket}/${filename}`;
    const absolutePath = join(UPLOAD_DIR, relativePath);

    await Bun.write(absolutePath, await file.arrayBuffer());

    return {
      filename: relativePath,
      url: Storage.url(relativePath),
      size: file.size,
      mimeType: file.type,
      mediaType: getMediaCategory(file.type),
    };
  },

  async delete(relativePath: string): Promise<void> {
    const absolutePath = join(UPLOAD_DIR, relativePath);
    if (!existsSync(absolutePath)) {
      const err: StorageError = { code: "NOT_FOUND", path: relativePath };
      throw err;
    }
    await unlink(absolutePath);
  },

  url(relativePath: string): string {
    return `${env.BETTER_AUTH_URL}/uploads/${relativePath}`;
  },

  pathFromUrl(url: string): string {
    const idx = url.indexOf("/uploads/");
    return idx === -1 ? url : url.slice(idx + "/uploads/".length);
  },
} as const;

export async function readAudioBuffer(url: string): Promise<Buffer> {
  // Si c'est une URL locale (notre serveur), on lit depuis le disque
  if (url.includes("/uploads/")) {
    const relativePath = Storage.pathFromUrl(url);
    const absolutePath = join(UPLOAD_DIR, relativePath);
    const file = Bun.file(absolutePath);
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  // Sinon fetch HTTP normal (URL externe)
  return fetchBuffer(url);
}
