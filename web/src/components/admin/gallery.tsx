import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ImagePlus, Loader2, Play, Plus, X } from "lucide-react";
import { apiServerClient } from "#/lib/api";
import GalleryCard from "../card/gallery-card";
import type { FormState, GalleryItem } from "#/types/gallery";
import { ACCEPT } from "#/lib/constant";

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  pageOrder: "0",
  mediaFile: null,
  mediaPreview: null,
  mediaType: null,
});

export function AdminGalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch("/gallery", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Impossible de charger la galerie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setEditTarget(null);
    setDialogMode("create");
  };

  const openEdit = (item: GalleryItem) => {
    setForm({
      title: item.title,
      description: item.description ?? "",
      pageOrder: String(item.pageOrder),
      mediaFile: null,
      mediaPreview: item.imageUrl,
      mediaType: item.mediaType,
    });
    setEditTarget(item);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditTarget(null);
    setForm(emptyForm());
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setForm((f) => ({
      ...f,
      mediaFile: file,
      mediaPreview: URL.createObjectURL(file),
      mediaType: isVideo ? "VIDEO" : "IMAGE",
    }));
  };

  const clearMedia = () => {
    setForm((f) => ({
      ...f,
      mediaFile: null,
      mediaPreview: null,
      mediaType: null,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (dialogMode === "create" && !form.mediaFile) {
      toast.error("Un fichier média est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("pageOrder", String(Number(form.pageOrder) || 0));
      if (form.mediaFile) fd.append("media", form.mediaFile);

      const res = await apiServerClient.fetch(
        dialogMode === "edit" ? `/gallery/${editTarget!.id}` : "/gallery",
        {
          method: dialogMode === "edit" ? "PUT" : "POST",
          body: fd,
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? "Erreur serveur");
      }

      toast.success(
        dialogMode === "edit" ? "Item mis à jour." : "Item ajouté.",
      );
      closeDialog();
      await fetchItems();
    } catch (e: any) {
      toast.error(e.message ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await apiServerClient.fetch(`/gallery/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success("Item supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-md p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Galerie</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} média{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un média
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md gap-3">
            <ImagePlus className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              Aucun média pour l'instant.
            </p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Ajouter le premier média
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Modifier le média" : "Ajouter un média"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Fichier
                {dialogMode === "create" && (
                  <span className="text-destructive"> *</span>
                )}
              </label>

              {form.mediaPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  {form.mediaType === "VIDEO" ? (
                    <video
                      src={form.mediaPreview}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={form.mediaPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={clearMedia}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-black transition-colors z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                    {form.mediaType === "VIDEO" ? "Vidéo" : "Image"}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-3">
                    <ImagePlus className="w-7 h-7" />
                    <Play className="w-7 h-7" />
                  </div>
                  <span className="text-sm">
                    Cliquer pour choisir un fichier
                  </span>
                  <span className="text-xs opacity-70">
                    Images : JPG, PNG, WEBP — max 10 MB
                  </span>
                  <span className="text-xs opacity-70">
                    Vidéos : MP4, WEBM, MOV — max 200 MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleMediaChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Titre <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Titre du média"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description courte…"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ordre d'affichage</label>
              <Input
                type="number"
                min={0}
                value={form.pageOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pageOrder: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Les valeurs les plus basses s'affichent en premier.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {dialogMode === "edit" ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleteTarget?.title}» sera définitivement supprimé. Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
