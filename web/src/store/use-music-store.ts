import { create } from "zustand";
import type {
  Album,
  AlbumFormState,
  Track,
  TrackFormState,
} from "#/types/album";
import apiServerClient from "#/lib/api";
import { albumFormToFormData, trackFormToFormData } from "#/lib/helpers";

type MusicStore = {
  albums: Album[];
  singles: Track[];
  tracks: Track[];
  loading: boolean;
  error: string | null;

  // Public
  fetchPublicAlbums: () => Promise<void>;
  fetchPublicSingles: () => Promise<void>;
  fetchPublicTracks: (albumId?: string) => Promise<void>;
  fetchPublicCatalog: () => Promise<void>;

  // Admin
  fetchAllAlbums: () => Promise<void>;
  fetchAllTracks: (albumId?: string) => Promise<void>;
  fetchAll: () => Promise<void>;

  // Album mutations
  createAlbum: (form: AlbumFormState) => Promise<Album | null>;
  updateAlbum: (
    id: string,
    form: Partial<AlbumFormState>,
  ) => Promise<Album | null>;
  toggleAlbumPublish: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;

  // Track mutations
  createTrack: (form: TrackFormState) => Promise<Track | null>;
  updateTrack: (
    id: string,
    form: Partial<TrackFormState>,
  ) => Promise<Track | null>;
  toggleTrackPublish: (id: string) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;

  clearError: () => void;
};

export const useMusicStore = create<MusicStore>((set) => ({
  albums: [],
  singles: [],
  tracks: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchPublicAlbums: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiServerClient.fetch("/music/albums");
      if (!res.ok) throw new Error("Erreur chargement albums");
      set({ albums: await res.json() });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPublicSingles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiServerClient.fetch("/music/singles");
      if (!res.ok) throw new Error("Erreur chargement singles");
      set({ singles: await res.json() });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPublicCatalog: async () => {
    set({ loading: true, error: null });
    try {
      const [aRes, sRes] = await Promise.all([
        apiServerClient.fetch("/music/albums"),
        apiServerClient.fetch("/music/singles"),
      ]);

      const [albums, singles] = await Promise.all([
        aRes.ok ? aRes.json() : Promise.resolve([]),
        sRes.ok ? sRes.json() : Promise.resolve([]),
      ]);

      set({ albums, singles });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPublicTracks: async (albumId?: string) => {
    set({ loading: true, error: null });
    try {
      const url = albumId
        ? `/music/tracks?albumId=${albumId}`
        : "/music/tracks";
      const res = await apiServerClient.fetch(url);
      if (!res.ok) throw new Error("Erreur chargement pistes");
      set({ tracks: await res.json() });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllAlbums: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiServerClient.fetch("/music/albums/all", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur chargement albums");
      set({ albums: await res.json() });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllTracks: async (albumId?: string) => {
    set({ loading: true, error: null });
    try {
      const url = albumId
        ? `/music/tracks/all?albumId=${albumId}`
        : "/music/tracks/all";
      const res = await apiServerClient.fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement pistes");
      set({ tracks: await res.json() });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [aRes, tRes] = await Promise.all([
        apiServerClient.fetch("/music/albums/all", { credentials: "include" }),
        apiServerClient.fetch("/music/tracks/all", { credentials: "include" }),
      ]);
      const [albums, tracks] = await Promise.all([
        aRes.ok ? aRes.json() : Promise.resolve([]),
        tRes.ok ? tRes.json() : Promise.resolve([]),
      ]);
      set({ albums, tracks });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      set({ loading: false });
    }
  },

  createAlbum: async (form) => {
    try {
      const res = await apiServerClient.fetch("/music/albums", {
        method: "POST",
        credentials: "include",
        body: albumFormToFormData(form),
      });
      if (!res.ok) throw new Error("Erreur création album");
      const album: Album = await res.json();
      set((s) => ({ albums: [album, ...s.albums] }));
      return album;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
      return null;
    }
  },

  updateAlbum: async (id, form) => {
    try {
      const res = await apiServerClient.fetch(`/music/albums/${id}`, {
        method: "PUT",
        credentials: "include",
        body: albumFormToFormData(form),
      });
      if (!res.ok) throw new Error("Erreur mise à jour album");
      const updated: Album = await res.json();
      set((s) => ({
        albums: s.albums.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
      return null;
    }
  },

  toggleAlbumPublish: async (id) => {
    try {
      const res = await apiServerClient.fetch(`/music/albums/${id}/publish`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur publication album");
      const { published } = await res.json();
      set((s) => ({
        albums: s.albums.map((a) => (a.id === id ? { ...a, published } : a)),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    }
  },

  deleteAlbum: async (id) => {
    try {
      const res = await apiServerClient.fetch(`/music/albums/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204)
        throw new Error("Erreur suppression album");
      set((s) => ({ albums: s.albums.filter((a) => a.id !== id) }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    }
  },

  createTrack: async (form) => {
    try {
      const res = await apiServerClient.fetch("/music/tracks", {
        method: "POST",
        credentials: "include",
        body: trackFormToFormData(form),
      });
      if (!res.ok) throw new Error("Erreur création piste");
      const track: Track = await res.json();
      set((s) => ({ tracks: [track, ...s.tracks] }));
      if (!track.albumId) {
        set((s) => ({ singles: [track, ...s.singles] }));
      } else {
        set((s) => ({
          albums: s.albums.map((a) =>
            a.id === track.albumId ? { ...a, tracks: [...a.tracks, track] } : a,
          ),
        }));
      }
      return track;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
      return null;
    }
  },

  updateTrack: async (id, form) => {
    try {
      const res = await apiServerClient.fetch(`/music/tracks/${id}`, {
        method: "PUT",
        credentials: "include",
        body: trackFormToFormData(form),
      });
      if (!res.ok) throw new Error("Erreur mise à jour piste");
      const updated: Track = await res.json();
      set((s) => ({
        tracks: s.tracks.map((t) => (t.id === id ? updated : t)),
        singles: s.singles.map((t) => (t.id === id ? updated : t)),
        albums: s.albums.map((a) => ({
          ...a,
          tracks: a.tracks.map((t) => (t.id === id ? updated : t)),
        })),
      }));
      return updated;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
      return null;
    }
  },

  toggleTrackPublish: async (id) => {
    try {
      const res = await apiServerClient.fetch(`/music/tracks/${id}/publish`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur publication piste");
      const { published } = await res.json();
      set((s) => ({
        tracks: s.tracks.map((t) => (t.id === id ? { ...t, published } : t)),
        singles: s.singles.map((t) => (t.id === id ? { ...t, published } : t)),
        albums: s.albums.map((a) => ({
          ...a,
          tracks: a.tracks.map((t) => (t.id === id ? { ...t, published } : t)),
        })),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    }
  },

  deleteTrack: async (id) => {
    try {
      const res = await apiServerClient.fetch(`/music/tracks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204)
        throw new Error("Erreur suppression piste");
      set((s) => ({
        tracks: s.tracks.filter((t) => t.id !== id),
        singles: s.singles.filter((t) => t.id !== id),
        albums: s.albums.map((a) => ({
          ...a,
          tracks: a.tracks.filter((t) => t.id !== id),
        })),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Erreur inconnue" });
    }
  },
}));
