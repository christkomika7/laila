import type { Product } from "#/types/product";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatXAF = (cents: number, currency = "XAF"): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents);

export const formatDuration = (seconds?: number): string => {
  if (!seconds || isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const isAvailable = (product: Product): boolean =>
  product.purchasable &&
  product.variants.some((v) => !v.manageInventory || v.inventoryQuantity > 0);

export function formatPrice(cents: number, currency = "XAF") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents);
}

export const productKey = (productId: string, variantId: string) =>
  `product:${productId}:${variantId}`;

export const trackKey = (trackId: string) => `track:${trackId}`;
export const albumKey = (albumId: string) => `album:${albumId}`;

export const getBasePrice = (product: Product): number => {
  const first = product.variants?.[0];
  if (!first) return 0;
  return first.salePriceInCents ?? first.priceInCents;
};

export const formatCurrency = (amount: number, currency = "XAF") => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
  }
};
