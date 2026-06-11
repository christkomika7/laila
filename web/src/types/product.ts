export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  position: number;
}

export interface ProductVariant {
  id?: string;
  productId?: string;
  title: string;
  priceInCents: number;
  salePriceInCents: number | null;
  currency: string;
  inventoryQuantity: number;
  manageInventory: boolean;
  sku: string | null;
  imageUrl: string | null;
}

export interface ProductInfo {
  id?: string;
  title: string;
  description: string;
  order?: number;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  ribbonText: string | null;
  coverImage: string;
  artist: string | null;
  onlineStoreId: string | null;
  purchasable: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
  additionalInfo: ProductInfo[];
  tags: string[];
}

export interface ProductFormState {
  title: string;
  subtitle: string;
  description: string;
  ribbonText: string;
  artist: string;
  onlineStoreId: string;
  purchasable: "true" | "false";
  status: ProductStatus;

  coverImage: File | null;
  coverPreview: string | null;

  galleryImages: File[];
  galleryPreviews: string[];
  existingGalleryImages: ProductImage[];

  variants: ProductVariantForm[];
  additionalInfo: ProductInfo[];
  tags: string[];
}

export interface ProductVariantForm {
  id?: string;
  title: string;
  priceInCents: number;
  salePriceInCents: number | null;
  currency: string;
  inventoryQuantity: number;
  manageInventory: boolean;
  sku: string | null;
  imageUrl: string | null;
  imageFile: File | null;
  imagePreview: string | null;
}
