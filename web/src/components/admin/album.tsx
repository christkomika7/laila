import {
  Eye,
  EyeOff,
  Loader2,
  Music2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiServerClient } from "#/lib/api";
import { emptyAlbumForm, emptyTrackForm } from "#/lib/helpers";
import { CoverPicker } from "../ui/cover-picker";
import { FileField } from "../ui/field-file";
import { TrackRow } from "../ui/track-row";
import DeleteConfirm from "../ui/delete-confirm";
import type {
  Album,
  AlbumFormState,
  Track,
  TrackFormState,
} from "#/types/album";

export default function AdminAlbum() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

  const [albumDialog, setAlbumDialog] = useState<"create" | "edit" | null>(
    null,
  );
  const [albumEditTarget, setAlbumEditTarget] = useState<Album | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumFormState>(emptyAlbumForm());

  const [trackDialog, setTrackDialog] = useState<"create" | "edit" | null>(
    null,
  );
  const [trackEditTarget, setTrackEditTarget] = useState<Track | null>(null);
  const [trackForm, setTrackForm] = useState<TrackFormState>(emptyTrackForm());

  const [deleteAlbum, setDeleteAlbum] = useState<Album | null>(null);
  const [deleteTrack, setDeleteTrack] = useState<Track | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, tRes] = await Promise.all([
        apiServerClient.fetch("/music/albums/all", { credentials: "include" }),
        apiServerClient.fetch("/music/tracks/all", { credentials: "include" }),
      ]);
      if (aRes.ok) setAlbums(await aRes.json());
      if (tRes.ok) setTracks(await tRes.json());
    } catch {
      toast.error("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateAlbum = () => {
    setAlbumForm(emptyAlbumForm());
    setAlbumEditTarget(null);
    setAlbumDialog("create");
  };

  const openEditAlbum = (album: Album) => {
    setAlbumForm({
      title: album.title,
      releaseDate: album.releaseDate.slice(0, 10),
      description: album.description ?? "",
      published: album.published,
      coverFile: null,
      coverPreview: album.coverUrl,
    });
    setAlbumEditTarget(album);
    setAlbumDialog("edit");
  };

  const submitAlbum = async () => {
    if (!albumForm.title.trim() || !albumForm.releaseDate) {
      toast.error("Titre et date de sortie requis.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", albumForm.title.trim());
      fd.append("releaseDate", albumForm.releaseDate);
      fd.append("description", albumForm.description.trim());
      fd.append("published", String(albumForm.published));
      if (albumForm.coverFile) fd.append("cover", albumForm.coverFile);

      const res = await apiServerClient.fetch(
        albumDialog === "edit"
          ? `/music/albums/${albumEditTarget!.id}`
          : "/music/albums",
        {
          method: albumDialog === "edit" ? "PUT" : "POST",
          body: fd,
          credentials: "include",
        },
      );

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ?? "Erreur serveur",
        );
      toast.success(
        albumDialog === "edit" ? "Album mis à jour." : "Album créé.",
      );
      setAlbumDialog(null);
      await fetchAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublishAlbum = async (album: Album) => {
    try {
      const res = await apiServerClient.fetch(
        `/music/albums/${album.id}/publish`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error();
      const { published } = await res.json();
      setAlbums((prev) =>
        prev.map((a) => (a.id === album.id ? { ...a, published } : a)),
      );
      toast.success(published ? "Album publié." : "Album dépublié.");
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbum) return;
    setSubmitting(true);
    try {
      const res = await apiServerClient.fetch(
        `/music/albums/${deleteAlbum.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok && res.status !== 204) throw new Error();
      toast.success("Album supprimé.");
      await fetchAll();
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
      setDeleteAlbum(null);
    }
  };

  const openCreateTrack = () => {
    setTrackForm(emptyTrackForm());
    setTrackEditTarget(null);
    setTrackDialog("create");
  };

  const openEditTrack = (track: Track) => {
    setTrackForm({
      title: track.title,
      albumId: track.albumId ?? "none",
      duration: String(track.duration),
      price: String(track.price),
      featuringArtists: track.featuringArtists.join(", "),
      published: track.published,
      coverFile: null,
      coverPreview: track.coverUrl,
      previewFile: null,
      fullAudioFile: null,
    });
    setTrackEditTarget(track);
    setTrackDialog("edit");
  };

  const submitTrack = async () => {
    if (!trackForm.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (trackDialog === "create" && !trackForm.fullAudioFile) {
      toast.error("Le fichier audio complet est requis.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", trackForm.title.trim());
      fd.append("albumId", trackForm.albumId);
      fd.append("duration", trackForm.duration);
      fd.append("price", trackForm.price);
      fd.append("featuringArtists", trackForm.featuringArtists);
      fd.append("published", String(trackForm.published));
      if (trackForm.fullAudioFile)
        fd.append("fullAudio", trackForm.fullAudioFile);
      if (trackForm.previewFile) fd.append("preview", trackForm.previewFile);
      if (trackForm.coverFile) fd.append("cover", trackForm.coverFile);

      const res = await apiServerClient.fetch(
        trackDialog === "edit"
          ? `/music/tracks/${trackEditTarget!.id}`
          : "/music/tracks",
        {
          method: trackDialog === "edit" ? "PUT" : "POST",
          body: fd,
          credentials: "include",
        },
      );

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ?? "Erreur serveur",
        );
      toast.success(
        trackDialog === "edit" ? "Titre mis à jour." : "Titre uploadé.",
      );
      setTrackDialog(null);
      await fetchAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublishTrack = async (track: Track) => {
    try {
      const res = await apiServerClient.fetch(
        `/music/tracks/${track.id}/publish`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error();
      const { published } = await res.json();
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, published } : t)),
      );
      toast.success(published ? "Titre publié." : "Titre dépublié.");
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const handleDeleteTrack = async () => {
    if (!deleteTrack) return;
    setSubmitting(true);
    try {
      const res = await apiServerClient.fetch(
        `/music/tracks/${deleteTrack.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok && res.status !== 204) throw new Error();
      toast.success("Titre supprimé.");
      await fetchAll();
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
      setDeleteTrack(null);
    }
  };

  const singles = tracks.filter((t) => !t.albumId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Albums</h2>
          <Button onClick={openCreateAlbum} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvel album
          </Button>
        </div>

        {albums.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Aucun album pour l'instant.
          </p>
        ) : (
          <div className="space-y-3">
            {albums.map((album) => (
              <div
                key={album.id}
                className="border border-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4 bg-muted/20">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music2 className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">
                        {album.title}
                      </span>
                      <Badge
                        variant={album.published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {album.published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(album.releaseDate).toLocaleDateString("fr-FR")}
                      {" · "}
                      {album.tracks.length} titre
                      {album.tracks.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedAlbum(
                          expandedAlbum === album.id ? null : album.id,
                        )
                      }
                      className="gap-1 text-xs"
                    >
                      {expandedAlbum === album.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Titres
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditAlbum(album)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePublishAlbum(album)}
                    >
                      {album.published ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteAlbum(album)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {expandedAlbum === album.id && (
                  <div className="border-t border-border divide-y divide-border">
                    {album.tracks.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4">
                        Aucun titre dans cet album.
                      </p>
                    ) : (
                      album.tracks.map((track) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          onEdit={() => openEditTrack(track)}
                          onPublish={() => togglePublishTrack(track)}
                          onDelete={() => setDeleteTrack(track)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Singles{" "}
            <span className="text-base font-normal text-muted-foreground">
              — sans album
            </span>
          </h2>
          <Button onClick={openCreateTrack} className="gap-2">
            <Upload className="w-4 h-4" /> Uploader un titre
          </Button>
        </div>

        {singles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Aucun single pour l'instant.
          </p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {singles.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                onEdit={() => openEditTrack(track)}
                onPublish={() => togglePublishTrack(track)}
                onDelete={() => setDeleteTrack(track)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={albumDialog !== null}
        onOpenChange={(o) => !o && setAlbumDialog(null)}
      >
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {albumDialog === "edit" ? "Modifier l'album" : "Créer un album"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={albumForm.title}
                  onChange={(e) =>
                    setAlbumForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Nom de l'album"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Date de sortie <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={albumForm.releaseDate}
                  onChange={(e) =>
                    setAlbumForm((f) => ({ ...f, releaseDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={albumForm.description}
                rows={3}
                onChange={(e) =>
                  setAlbumForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description optionnelle…"
              />
            </div>
            <CoverPicker
              preview={albumForm.coverPreview}
              onFile={(f) =>
                setAlbumForm((p) => ({
                  ...p,
                  coverFile: f,
                  coverPreview: URL.createObjectURL(f),
                }))
              }
              onClear={() =>
                setAlbumForm((p) => ({
                  ...p,
                  coverFile: null,
                  coverPreview: null,
                }))
              }
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setAlbumForm((f) => ({ ...f, published: !f.published }))
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${albumForm.published ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${albumForm.published ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm font-medium">Publier immédiatement</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setAlbumDialog(null)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={submitAlbum}
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {albumDialog === "edit" ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={trackDialog !== null}
        onOpenChange={(o) => !o && setTrackDialog(null)}
      >
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {trackDialog === "edit"
                ? "Modifier le titre"
                : "Uploader un titre"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={trackForm.title}
                  onChange={(e) =>
                    setTrackForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Nom du morceau"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Album</Label>
                <Select
                  value={trackForm.albumId}
                  onValueChange={(v) =>
                    setTrackForm((f) => ({ ...f, albumId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un album" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun (Single)</SelectItem>
                    {albums.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Durée (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={trackForm.duration}
                  onChange={(e) =>
                    setTrackForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="3.45"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Prix (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={trackForm.price}
                  onChange={(e) =>
                    setTrackForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="1.29"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Artistes en featuring</Label>
              <Input
                value={trackForm.featuringArtists}
                onChange={(e) =>
                  setTrackForm((f) => ({
                    ...f,
                    featuringArtists: e.target.value,
                  }))
                }
                placeholder="Artist A, Artist B"
              />
            </div>
            <FileField
              label="Fichier audio complet"
              required={trackDialog === "create"}
              accept="audio/*"
              hint="MP3, WAV, FLAC — max 100 MB"
              value={trackForm.fullAudioFile}
              onChange={(f) =>
                setTrackForm((p) => ({ ...p, fullAudioFile: f }))
              }
              onClear={() =>
                setTrackForm((p) => ({ ...p, fullAudioFile: null }))
              }
            />
            <FileField
              label="Extrait (preview)"
              accept="audio/*"
              hint="30 sec recommandé"
              value={trackForm.previewFile}
              onChange={(f) => setTrackForm((p) => ({ ...p, previewFile: f }))}
              onClear={() => setTrackForm((p) => ({ ...p, previewFile: null }))}
            />
            <CoverPicker
              preview={trackForm.coverPreview}
              onFile={(f) =>
                setTrackForm((p) => ({
                  ...p,
                  coverFile: f,
                  coverPreview: URL.createObjectURL(f),
                }))
              }
              onClear={() =>
                setTrackForm((p) => ({
                  ...p,
                  coverFile: null,
                  coverPreview: null,
                }))
              }
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setTrackForm((f) => ({ ...f, published: !f.published }))
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${trackForm.published ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${trackForm.published ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm font-medium">Publier immédiatement</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setTrackDialog(null)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={submitTrack}
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {trackDialog === "edit" ? "Enregistrer" : "Uploader"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={deleteAlbum !== null}
        title="Supprimer cet album ?"
        description={`${deleteAlbum?.title}» et tous ses titres seront définitivement supprimés.`}
        submitting={submitting}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteAlbum(null)}
      />
      <DeleteConfirm
        open={deleteTrack !== null}
        title="Supprimer ce titre ?"
        description={`«${deleteTrack?.title}» sera définitivement supprimé.`}
        submitting={submitting}
        onConfirm={handleDeleteTrack}
        onCancel={() => setDeleteTrack(null)}
      />
    </>
  );
}
