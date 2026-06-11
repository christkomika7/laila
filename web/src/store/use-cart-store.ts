import { cookieStorage, createSelectors } from "#/lib/store";
import { albumKey, productKey, trackKey } from "#/lib/utils";
import type { Album, Track } from "#/types/album";
import type { Product, ProductVariant } from "#/types/product";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItemType = "track" | "album" | "product";

export type CartItem = {
  id: string;
  type: CartItemType;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  // Toujours en unités entières de la devise (XAF = pas de décimales)
  priceInCents: number;
  currency: string;
  quantity: number;
  variantId?: string;
  variantTitle?: string;
};

type CartStore = {
  items: CartItem[];

  // Ajout
  addTrack: (track: Track) => void;
  addAlbum: (album: Album) => void;
  addProduct: (product: Product, variant: ProductVariant) => void;

  // Gestion
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Lecture
  hasItem: (id: string) => boolean;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCartStore = createSelectors(
  create<CartStore>()(
    persist(
      (set, get) => ({
        items: [],

        addTrack: (track) => {
          const key = trackKey(track.id);
          if (get().items.find((i) => i.id === key)) return;
          set((s) => ({
            items: [
              ...s.items,
              {
                id: key,
                type: "track",
                title: track.title,
                artist: track.album?.title ?? null,
                coverUrl: track.coverUrl ?? track.album?.coverUrl ?? null,
                // track.price est déjà en XAF entier (ex: 2000), pas besoin de * 100
                priceInCents: Math.round(track.price),
                currency: "XAF",
                quantity: 1,
              },
            ],
          }));
        },

        addAlbum: (album) => {
          const key = albumKey(album.id);
          if (get().items.find((i) => i.id === key)) return;
          // Somme des prix de chaque track — déjà en XAF entier
          const totalPrice = album.tracks.reduce(
            (sum, t) => sum + Math.round(t.price),
            0,
          );
          set((s) => ({
            items: [
              ...s.items,
              {
                id: key,
                type: "album",
                title: album.title,
                artist: null,
                coverUrl: album.coverUrl,
                priceInCents: totalPrice,
                currency: "XAF",
                quantity: 1,
              },
            ],
          }));
        },

        addProduct: (product, variant) => {
          if (!variant.id) return;
          const key = productKey(product.id, variant.id);
          if (get().items.find((i) => i.id === key)) return;
          // Les variantes produit viennent déjà en centimes depuis PocketBase
          const price = variant.salePriceInCents ?? variant.priceInCents;
          set((s) => ({
            items: [
              ...s.items,
              {
                id: key,
                type: "product",
                title: product.title,
                artist: product.artist,
                coverUrl: variant.imageUrl ?? product.coverImage ?? null,
                priceInCents: price,
                currency: variant.currency,
                quantity: 1,
                variantId: variant.id,
                variantTitle: variant.title,
              },
            ],
          }));
        },

        // ── Gestion ──────────────────────────────────────────────────────────
        removeItem: (id) =>
          set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

        updateQuantity: (id, quantity) => {
          if (quantity < 1) {
            get().removeItem(id);
            return;
          }
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          }));
        },

        clearCart: () => set({ items: [] }),

        hasItem: (id) => get().items.some((i) => i.id === id),

        itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

        subtotal: () =>
          get().items.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0),
      }),
      {
        name: "cart-storage",
        storage: createJSONStorage(() => cookieStorage),
      },
    ),
  ),
);
