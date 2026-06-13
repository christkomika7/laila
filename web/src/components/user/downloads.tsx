import apiServerClient from "#/lib/api";
import { format } from "date-fns";
import { Disc3, Download, Loader2, Music } from "lucide-react";
import { useEffect, useState } from "react";
import PremiumButton from "../ui/premiem.button";

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

async function downloadItem(
  type: "album" | "track",
  id: string,
  filename: string,
) {
  const res = await apiServerClient.fetch(
    `/purchases/download/item?type=${type}&id=${id}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Erreur téléchargement");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function UserDownloadsTab() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null); // item id en cours

  useEffect(() => {
    apiServerClient
      .fetch("/purchases/library", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setLibrary(data))
      .catch(() => setLibrary({ albums: [], singles: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadAll = async () => {
    setDownloading("all");
    try {
      const res = await apiServerClient.fetch("/purchases/download", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ma-musique.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silencieux
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAlbum = async (album: PurchasedAlbum) => {
    setDownloading(album.id);
    try {
      await downloadItem("album", album.id, `${album.title}.zip`);
    } catch {
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadTrack = async (track: PurchasedTrack) => {
    setDownloading(track.id);
    try {
      await downloadItem("track", track.id, `${track.title}.mp3`);
    } catch {
    } finally {
      setDownloading(null);
    }
  };

  const hasMusic =
    (library?.albums?.length ?? 0) + (library?.singles?.length ?? 0) > 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Mes Téléchargements
        </h2>
        {hasMusic && (
          <PremiumButton
            size="sm"
            disabled={downloading === "all"}
            onClick={handleDownloadAll}
          >
            {downloading === "all" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Tout télécharger (.zip)
          </PremiumButton>
        )}
      </div>

      {!hasMusic ? (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Aucun téléchargement disponible.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Albums ── */}
          {(library?.albums?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Albums
              </p>
              <div className="space-y-3">
                {library!.albums.map((album) => (
                  <div
                    key={album.id}
                    className="rounded-md border border-border bg-background/50 overflow-hidden"
                  >
                    {/* Album header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                          {album.coverUrl ? (
                            <img
                              src={album.coverUrl}
                              alt={album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Disc3 className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {album.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Album · {album.tracks.length} titre
                            {album.tracks.length > 1 ? "s" : ""} · Acheté le{" "}
                            {format(new Date(album.purchasedAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <PremiumButton
                        size="sm"
                        disabled={!!downloading}
                        onClick={() => handleDownloadAlbum(album)}
                        className="border-border text-foreground hover:bg-muted shrink-0"
                      >
                        {downloading === album.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </PremiumButton>
                    </div>

                    {/* Tracklist */}
                    <div className="border-t border-border divide-y divide-border/50">
                      {album.tracks.map((track, i) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 px-4 py-2 text-sm"
                        >
                          <span className="w-5 text-right text-muted-foreground text-xs shrink-0">
                            {i + 1}
                          </span>
                          <span className="truncate text-foreground/80 flex-1">
                            {track.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Singles ── */}
          {(library?.singles?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Singles
              </p>
              <div className="space-y-3">
                {library!.singles.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 rounded-md border border-border bg-background/50"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {track.featuringArtists
                            ? `feat. ${track.featuringArtists} · `
                            : ""}
                          {track.album ? ` · ${track.album.title}` : ""}
                          {" · "}Acheté le{" "}
                          {format(new Date(track.purchasedAt), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <PremiumButton
                      size="sm"
                      disabled={!!downloading}
                      onClick={() => handleDownloadTrack(track)}
                    >
                      {downloading === track.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" /> Télécharger
                        </>
                      )}
                    </PremiumButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
