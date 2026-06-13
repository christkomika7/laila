import type { AlbumFormState, TrackFormState } from "#/types/album";
import type { CheckoutPayload, CheckoutResponse } from "#/types/checkout";
import type { State, Action } from "#/types/gallery";
import apiServerClient from "./api";
import { WORLD_COUNTRIES } from "./data";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "idle",
        items: action.payload,
        currentIndex: 0,
      };
    case "FETCH_ERROR":
      return { ...state, status: "error" };
    case "NAVIGATE":
      return {
        ...state,
        currentIndex: action.index,
        direction: action.direction,
      };
    case "SET_MOBILE":
      return { ...state, isMobile: action.value, currentIndex: 0 };
    default:
      return state;
  }
}

export const emptyAlbumForm = (): AlbumFormState => ({
  title: "",
  releaseDate: "",
  description: "",
  published: false,
  coverFile: null,
  coverPreview: null,
});

export const emptyTrackForm = (): TrackFormState => ({
  title: "",
  albumId: "none",
  duration: "",
  price: "",
  featuringArtists: "",
  published: false,
  coverFile: null,
  coverPreview: null,
  previewFile: null,
  fullAudioFile: null,
});

export function albumFormToFormData(form: Partial<AlbumFormState>): FormData {
  const fd = new FormData();
  if (form.title !== undefined) fd.append("title", form.title);
  if (form.releaseDate !== undefined)
    fd.append("releaseDate", form.releaseDate);
  if (form.description !== undefined)
    fd.append("description", form.description);
  if (form.published !== undefined)
    fd.append("published", String(form.published));
  if (form.coverFile) fd.append("cover", form.coverFile);
  return fd;
}

export function trackFormToFormData(form: Partial<TrackFormState>): FormData {
  const fd = new FormData();
  if (form.title !== undefined) fd.append("title", form.title);
  if (form.albumId !== undefined) fd.append("albumId", form.albumId);
  if (form.duration !== undefined) fd.append("duration", form.duration);
  if (form.price !== undefined) fd.append("price", form.price);
  if (form.featuringArtists !== undefined)
    fd.append("featuringArtists", form.featuringArtists);
  if (form.published !== undefined)
    fd.append("published", String(form.published));
  if (form.coverFile) fd.append("cover", form.coverFile);
  if (form.previewFile) fd.append("preview", form.previewFile);
  if (form.fullAudioFile) fd.append("fullAudio", form.fullAudioFile);
  return fd;
}

export const isResilience = (title: string): boolean => {
  if (!title) return false;
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized.includes("resilience");
};

export function resolveImg(record: any): string | null {
  if (!record) return null;
  if (record.imageUrl && record.imageUrl.startsWith("http"))
    return record.imageUrl;
  if (record.media && typeof record.media === "string")
    return record.media.startsWith("http") ? record.media : null;
  return null;
}

export async function pollPaymentStatus(
  paymentId: string,
  signal: AbortSignal,
): Promise<"COMPLETED" | "FAILED"> {
  const MAX_ATTEMPTS = 40; // ~2 minutes with 3s interval
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    if (signal.aborted) throw new Error("Polling annulé");

    await new Promise((r) => setTimeout(r, 3000));

    const res = await apiServerClient.fetch(`/payments/${paymentId}/status`);
    if (!res.ok) {
      attempts++;
      continue;
    }

    const data = await res.json();
    const s: string = data.status ?? "";

    if (s === "COMPLETED" || s === "SUCCEEDED") return "COMPLETED";
    if (s === "FAILED" || s === "CANCELLED") return "FAILED";

    attempts++;
  }

  throw new Error("Délai d'attente dépassé. Vérifiez votre téléphone.");
}

export async function callCheckout(
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  const res = await apiServerClient.fetch("/checkout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Erreur serveur (${res.status})`);
  }

  return data as CheckoutResponse;
}

export function getCountry(code: string) {
  return WORLD_COUNTRIES.find((c) => c.code === code)?.name || "NC";
}
