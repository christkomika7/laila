import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { extname } from "path";
import { Storage } from "../lib/storage";
import {
  ALL_ALLOWED_TYPES,
  AUDIO_TYPES,
  IMAGE_TYPES,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MediaCategory,
  UploadOptions,
  VIDEO_TYPES,
} from "../config/storage";
import { CartItem } from "../types/payment";

export function formatItem(item: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO";
  pageOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...item,
    imageUrl: Storage.url(item.imageUrl),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function uploadErrorMessage(err: any): string {
  if (err?.code === "FILE_TOO_LARGE") {
    return isVideoMime(err?.mimeType ?? "")
      ? "Vidéo trop lourde (max 200 MB)"
      : "Image trop lourde (max 10 MB)";
  }
  if (err?.code === "INVALID_TYPE") {
    return "Format non supporté (jpg, png, webp, gif, mp4, webm, mov)";
  }
  return "Erreur d'upload";
}

export function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}
export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}
export function isAudioMime(mime: string) {
  return mime.startsWith("audio/");
}

export function getMediaCategory(mime: string): MediaCategory {
  if (isVideoMime(mime)) return "VIDEO";
  if (isAudioMime(mime)) return "AUDIO";
  return "IMAGE";
}

export function generateFilename(originalName: string): string {
  const ext = extname(originalName).toLowerCase() || ".bin";
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${Date.now()}_${uid}${ext}`;
}

export async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

export function getAllowedForOption(
  accept: UploadOptions["accept"],
): readonly string[] {
  switch (accept) {
    case "image":
      return IMAGE_TYPES;
    case "video":
      return VIDEO_TYPES;
    case "audio":
      return AUDIO_TYPES;
    case "image|video":
      return [...IMAGE_TYPES, ...VIDEO_TYPES];
    default:
      return ALL_ALLOWED_TYPES;
  }
}

export function getMaxSize(mime: string): number {
  if (isVideoMime(mime)) return MAX_VIDEO_SIZE;
  if (isAudioMime(mime)) return MAX_AUDIO_SIZE;
  return MAX_IMAGE_SIZE;
}

export function formatAlbum(album: any) {
  return {
    ...album,
    coverUrl: album.coverUrl ? Storage.url(album.coverUrl) : null,
    releaseDate:
      album.releaseDate instanceof Date
        ? album.releaseDate.toISOString()
        : album.releaseDate,
    createdAt:
      album.createdAt instanceof Date
        ? album.createdAt.toISOString()
        : album.createdAt,
    updatedAt:
      album.updatedAt instanceof Date
        ? album.updatedAt.toISOString()
        : album.updatedAt,
    tracks: album.tracks ? album.tracks.map(formatTrack) : undefined,
  };
}

export function formatTrack(track: any) {
  return {
    ...track,
    coverUrl: track.coverUrl ? Storage.url(track.coverUrl) : null,
    previewUrl: track.previewUrl ? Storage.url(track.previewUrl) : null,
    fullAudioUrl: track.fullAudioUrl ? Storage.url(track.fullAudioUrl) : null,
    featuringArtists: track.featuringArtists
      ? JSON.parse(track.featuringArtists)
      : [],
    createdAt:
      track.createdAt instanceof Date
        ? track.createdAt.toISOString()
        : track.createdAt,
    updatedAt:
      track.updatedAt instanceof Date
        ? track.updatedAt.toISOString()
        : track.updatedAt,
  };
}

export async function uploadCover(file: File, set: any): Promise<string> {
  return Storage.upload(file, "covers", { accept: "image" }).then(
    (r) => r.filename,
    (err) => {
      set.status = 422;
      throw new Error(
        err.code === "INVALID_TYPE"
          ? "La pochette doit être une image (jpg, png, webp, gif)"
          : "Pochette trop lourde (max 10 MB)",
      );
    },
  );
}

export async function uploadAudio(file: File, set: any): Promise<string> {
  return Storage.upload(file, "audio", { accept: "audio" }).then(
    (r) => r.filename,
    (err) => {
      set.status = 422;
      throw new Error(
        err.code === "INVALID_TYPE"
          ? "Format audio non supporté (mp3, wav, flac, aac, ogg)"
          : "Fichier audio trop lourd (max 100 MB)",
      );
    },
  );
}

export function formatProduct(p: any) {
  return {
    ...p,
    coverImage: p.coverImage ? Storage.url(p.coverImage) : null,
    images: (p.images ?? []).map((i: any) => ({
      ...i,
      url: Storage.url(i.url),
    })),
    variants: (p.variants ?? []).map((v: any) => ({
      ...v,
      imageUrl: v.imageUrl ? Storage.url(v.imageUrl) : null,
    })),
    additionalInfo: p.additionalInfo ?? [],
    tags: p.tags?.map((t: any) => t.value) ?? [],
  };
}

export function formatPrice(cents: number, currency = "XAF") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents);
}

export function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0);
}

export function extractVariantId(raw: string): string {
  const parts = raw.split(":");
  return parts[parts.length - 1];
}

export function isPhysicalProduct(rawVariantId: string): boolean {
  return (
    !rawVariantId.startsWith("track:") && !rawVariantId.startsWith("album:")
  );
}
