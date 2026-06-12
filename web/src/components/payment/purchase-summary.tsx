import apiServerClient from "#/lib/api";
import { Download, Loader2, Music, Disc3 } from "lucide-react";
import { useEffect, useState } from "react";

interface PurchasedTrack {
  id: string;
  title: string;
  duration: number;
  coverUrl: string | null;
  fullAudioUrl: string;
  featuringArtists: string | null;
  album: { id: string; title: string; coverUrl: string | null } | null;
  purchasedAt: string;
}

interface PurchasedAlbum {
  id: string;
  title: string;
  coverUrl: string | null;
  tracks: {
    id: string;
    title: string;
    duration: number;
    coverUrl: string | null;
    fullAudioUrl: string;
    featuringArtists: string | null;
  }[];
  purchasedAt: string;
}

interface Library {
  albums: PurchasedAlbum[];
  singles: PurchasedTrack[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PurchaseSummary({ orderId }: { orderId: string | null }) {
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiServerClient
      .fetch(`/purchases/library?orderId=${orderId}`, {
        credentials: "include",
      })
      .then((r) => r.json())
      .then((data) => setLibrary(data))
      .catch(() => setLibrary({ albums: [], singles: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = orderId
        ? `/purchases/download?orderId=${orderId}`
        : "/purchases/download";
      const res = await apiServerClient.fetch(url, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur téléchargement");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = orderId
        ? `commande-${orderId.slice(0, 8)}.zip`
        : "ma-musique.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silencieux
    } finally {
      setDownloading(false);
    }
  };

  const hasMusic =
    (library?.albums?.length ?? 0) + (library?.singles?.length ?? 0) > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!hasMusic) return null;

  return (
    <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-semibold text-sm">
            Vos achats musicaux
          </h3>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {downloading ? "Préparation…" : "Tout télécharger (.zip)"}
        </button>
      </div>

      <div className="divide-y divide-neutral-800/60 max-h-80 overflow-y-auto">
        {/* Albums */}
        {library?.albums.map((album) => (
          <div key={album.id} className="px-5 py-3">
            <div className="flex items-center gap-3 mb-2">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-10 h-10 rounded-md object-cover shrink-0 border border-neutral-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                  <Disc3 className="w-5 h-5 text-neutral-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {album.title}
                </p>
                <p className="text-neutral-500 text-xs">
                  Album · {album.tracks.length} titre
                  {album.tracks.length > 1 ? "s" : ""}
                </p>
              </div>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium shrink-0">
                Album
              </span>
            </div>
            {/* Tracks de l'album */}
            <div className="ml-13 space-y-1 pl-13">
              {album.tracks.map((track, i) => (
                <div
                  key={track.id}
                  className="flex items-center gap-2 text-xs text-neutral-500 pl-1"
                >
                  <span className="w-4 text-right shrink-0 text-neutral-700">
                    {i + 1}
                  </span>
                  <span className="truncate text-neutral-400">
                    {track.title}
                  </span>
                  <span className="ml-auto shrink-0 font-mono">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Singles */}
        {library?.singles.map((track) => (
          <div key={track.id} className="px-5 py-3 flex items-center gap-3">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-10 h-10 rounded-md object-cover shrink-0 border border-neutral-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-neutral-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">
                {track.title}
              </p>
              <p className="text-neutral-500 text-xs">
                {track.featuringArtists
                  ? `feat. ${track.featuringArtists} · `
                  : ""}
                {formatDuration(track.duration)}
                {track.album ? ` · ${track.album.title}` : ""}
              </p>
            </div>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium shrink-0">
              Single
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
