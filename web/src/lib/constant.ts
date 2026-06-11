import type { ProductStatus } from "#/types/product";

export const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export const statusLabel: Record<ProductStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const statusVariant: Record<
  ProductStatus,
  "secondary" | "default" | "outline"
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};
