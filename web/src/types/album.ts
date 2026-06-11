export type Track = {
  id: string;
  title: string;
  duration: number;
  price: number;
  featuringArtists: string[];
  previewUrl: string | null;
  fullAudioUrl: string;
  coverUrl: string | null;
  albumId: string | null;
  published: boolean;
  album?: Album | null;
  createdAt: Date;
};

export type Album = {
  id: string;
  title: string;
  releaseDate: string;
  description: string | null;
  coverUrl: string | null;
  published: boolean;
  tracks: Track[];
  createdAt: Date;
};

export type AlbumFormState = {
  title: string;
  releaseDate: string;
  description: string;
  published: boolean;
  coverFile: File | null;
  coverPreview: string | null;
};

export type TrackFormState = {
  title: string;
  albumId: string;
  duration: string;
  price: string;
  featuringArtists: string;
  published: boolean;
  coverFile: File | null;
  coverPreview: string | null;
  previewFile: File | null;
  fullAudioFile: File | null;
};
