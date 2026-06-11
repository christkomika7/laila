import { AlbumCard } from "#/components/card/album-card";
import { SingleCard } from "#/components/card/single-card";
import Footer from "#/components/footer";
import Header from "#/components/header";
import CardSkeleton from "#/components/skeleton/card-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { useMusicStore } from "#/store/use-music-store";
import type { Album, Track } from "#/types/album";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Disc3, Music } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(public)/music")({
  head: () => ({
    title: "Catalogue Musical - Laila",
    meta: [
      {
        name: "description",
        content: "Explorez la collection complète des albums et singles",
      },
    ],
  }),
  component: RouteComponent,
});

function sortAlbums(items: Album[], sortBy: string): Album[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "-releaseDate":
        return (
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      case "releaseDate":
        return (
          new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "-title":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
}

function sortSingles(items: Track[], sortBy: string): Track[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "-releaseDate":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "releaseDate":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "-title":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
}

const SortSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[160px] bg-card border-border">
      <SelectValue placeholder="Trier par" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="-releaseDate">Plus récents</SelectItem>
      <SelectItem value="releaseDate">Plus anciens</SelectItem>
      <SelectItem value="title">Titre (A-Z)</SelectItem>
      <SelectItem value="-title">Titre (Z-A)</SelectItem>
    </SelectContent>
  </Select>
);

function RouteComponent() {
  const { albums, singles, loading, fetchPublicCatalog } = useMusicStore();
  const [albumSort, setAlbumSort] = useState("-releaseDate");
  const [singleSort, setSingleSort] = useState("-releaseDate");

  useEffect(() => {
    fetchPublicCatalog();
  }, [fetchPublicCatalog]);

  const sortedAlbums = sortAlbums(albums, albumSort);
  const sortedSingles = sortSingles(singles, singleSort);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Page header */}
            <div className="border-t border-border/50 pt-12 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Catalogue Musical
              </h1>
              <p className="text-xl text-muted-foreground">
                Explorez la collection complète des albums et singles
              </p>
            </div>

            {/* ── Albums section ── */}
            <section className="mb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Disc3 className="h-6 w-6 text-muted-foreground" />
                  <h2 className="text-2xl font-bold font-display">Albums</h2>
                  {!loading && (
                    <span className="text-sm text-muted-foreground relative top-1">
                      {sortedAlbums.length}{" "}
                      {sortedAlbums.length === 1 ? "album" : "albums"}
                    </span>
                  )}
                </div>
                <SortSelect value={albumSort} onChange={setAlbumSort} />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : sortedAlbums.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border">
                  <Disc3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                  <p className="text-lg font-semibold mb-1">
                    Aucun album pour le moment
                  </p>
                  <p className="text-muted-foreground">Revenez bientôt</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedAlbums.map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      <AlbumCard album={album} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-border/50 mb-20" />

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-muted-foreground" />
                  <h2 className="text-2xl font-bold">Singles</h2>
                  {!loading && (
                    <span className="text-sm text-muted-foreground relative top-0.5">
                      {sortedSingles.length}{" "}
                      {sortedSingles.length === 1 ? "single" : "singles"}
                    </span>
                  )}
                </div>
                <SortSelect value={singleSort} onChange={setSingleSort} />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : sortedSingles.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border">
                  <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                  <p className="text-lg font-semibold mb-1">
                    Aucun single pour le moment
                  </p>
                  <p className="text-muted-foreground">Revenez bientôt</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedSingles.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      <SingleCard track={track} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
