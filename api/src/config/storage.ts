import { join } from "node:path";

export const UPLOAD_DIR = join(process.cwd(), "uploads");

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; //  10 MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100 MB

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/ogg",
] as const;

export const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
] as const;

export const ALL_ALLOWED_TYPES = [
  ...IMAGE_TYPES,
  ...VIDEO_TYPES,
  ...AUDIO_TYPES,
] as const;

export type AllowedMimeType = (typeof ALL_ALLOWED_TYPES)[number];
export type MediaCategory = "IMAGE" | "VIDEO" | "AUDIO";
export type UploadOptions = {
  accept?: "image" | "video" | "audio" | "image|video" | "all";
};

export type UploadResult = {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  mediaType: MediaCategory;
};

export type StorageError =
  | { code: "FILE_TOO_LARGE"; max: number }
  | { code: "INVALID_TYPE"; allowed: readonly string[] }
  | { code: "NOT_FOUND"; path: string }
  | { code: "IO_ERROR"; message: string };
