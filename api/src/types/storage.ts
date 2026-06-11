import { ALLOWED_TYPES } from "../config/storage";

export type UploadResult = {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  mediaType: "IMAGE" | "VIDEO";
};

export type StorageError =
  | { code: "FILE_TOO_LARGE"; max: number }
  | { code: "INVALID_TYPE"; allowed: readonly string[] }
  | { code: "NOT_FOUND"; path: string }
  | { code: "IO_ERROR"; message: string };

export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];
