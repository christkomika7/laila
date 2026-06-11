export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  isExclusive: boolean;
  mediaType: "IMAGE" | "VIDEO";
  pageOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type FormState = {
  title: string;
  description: string;
  pageOrder: string;
  mediaFile: File | null;
  mediaPreview: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
};

export type State = {
  items: GalleryItem[];
  status: "idle" | "loading" | "error";
  currentIndex: number;
  direction: number;
  isMobile: boolean;
};

export type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: GalleryItem[] }
  | { type: "FETCH_ERROR" }
  | { type: "NAVIGATE"; index: number; direction: number }
  | { type: "SET_MOBILE"; value: boolean };

export interface BookPageProps {
  item: GalleryItem | undefined;
  pageNumber: number;
  isLeft: boolean;
  preload: boolean;
}

export type DesktopBookProps = {
  items: GalleryItem[];
  currentIndex: number;
  direction: number;
  leftItem: GalleryItem | undefined;
  rightItem: GalleryItem | undefined;
  onFlipStart: () => void;
  onFlipEnd: () => void;
};
