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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ImagePlus,
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  PackagePlus,
  Images,
} from "lucide-react";
import { apiServerClient } from "#/lib/api";
import type {
  Product,
  ProductFormState,
  ProductImage,
  ProductInfo,
  ProductStatus,
  ProductVariantForm,
} from "#/types/product";
import { ProductCard } from "../card/admin-product-card";
import { VariantRow } from "../ui/variant-row";

const emptyVariant = (): ProductVariantForm => ({
  title: "Standard",
  priceInCents: 0,
  salePriceInCents: null,
  currency: "XAF",
  inventoryQuantity: 0,
  manageInventory: true,
  sku: null,
  imageUrl: null,
  imageFile: null,
  imagePreview: null,
});

const emptyForm = (): ProductFormState => ({
  title: "",
  subtitle: "",
  description: "",
  ribbonText: "",
  artist: "",
  onlineStoreId: "",
  purchasable: "true",
  status: "DRAFT",
  coverImage: null,
  coverPreview: null,
  galleryImages: [],
  galleryPreviews: [],
  existingGalleryImages: [],
  variants: [emptyVariant()],
  additionalInfo: [],
  tags: [],
});

export function AdminProductTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [tagInput, setTagInput] = useState("");

  const [showVariants, setShowVariants] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch("/store/products", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setTagInput("");
    setEditTarget(null);
    setShowVariants(true);
    setShowInfo(false);
    setShowGallery(false);
    setDialogMode("create");
  };

  const openEdit = (product: Product) => {
    setForm({
      title: product.title,
      subtitle: product.subtitle ?? "",
      description: product.description,
      ribbonText: product.ribbonText ?? "",
      artist: product.artist ?? "",
      onlineStoreId: product.onlineStoreId ?? "",
      purchasable: product.purchasable ? "true" : "false",
      status: product.status,
      coverImage: null,
      coverPreview: product.coverImage ?? null,
      galleryImages: [],
      galleryPreviews: [],
      existingGalleryImages: product.images ?? [],
      variants:
        product.variants.length > 0
          ? product.variants.map((v) => ({
              ...v,
              imageFile: null,
              imagePreview: null,
            }))
          : [emptyVariant()],
      additionalInfo: product.additionalInfo.map((i) => ({ ...i })),
      tags: [...product.tags],
    });
    setTagInput("");
    setEditTarget(product);
    setShowVariants(true);
    setShowInfo(product.additionalInfo.length > 0);
    setShowGallery(product.images.length > 0);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    form.galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    form.variants.forEach((v) => {
      if (v.imagePreview) URL.revokeObjectURL(v.imagePreview);
    });
    if (form.coverPreview && form.coverImage)
      URL.revokeObjectURL(form.coverPreview);

    setDialogMode(null);
    setEditTarget(null);
    setForm(emptyForm());
    setTagInput("");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      coverImage: file,
      coverPreview: URL.createObjectURL(file),
    }));
  };

  const clearCover = () => {
    if (form.coverPreview && form.coverImage)
      URL.revokeObjectURL(form.coverPreview);
    setForm((f) => ({ ...f, coverImage: null, coverPreview: null }));
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files],
      galleryPreviews: [...prev.galleryPreviews, ...previews],
    }));
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryNew = (index: number) => {
    URL.revokeObjectURL(form.galleryPreviews[index]);
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
    }));
  };

  const removeExistingGallery = async (image: ProductImage) => {
    if (!editTarget) return;
    try {
      const res = await apiServerClient.fetch(
        `/store/products/${editTarget.id}/images/${image.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok && res.status !== 204) throw new Error();
      setForm((prev) => ({
        ...prev,
        existingGalleryImages: prev.existingGalleryImages.filter(
          (img) => img.id !== image.id,
        ),
      }));
      toast.success("Image supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression de l'image.");
    }
  };

  const handleVariantChange = (
    index: number,
    changes: Partial<ProductVariantForm>,
  ) => {
    setForm((f) => {
      const updated = [...f.variants];
      updated[index] = { ...updated[index], ...changes };
      return { ...f, variants: updated };
    });
  };

  const handleVariantImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.variants[index].imagePreview)
      URL.revokeObjectURL(form.variants[index].imagePreview!);
    const preview = URL.createObjectURL(file);
    handleVariantChange(index, { imageFile: file, imagePreview: preview });
  };

  const clearVariantImage = (index: number) => {
    if (form.variants[index].imagePreview)
      URL.revokeObjectURL(form.variants[index].imagePreview!);
    handleVariantChange(index, {
      imageFile: null,
      imagePreview: null,
      imageUrl: null,
    });
  };

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { ...emptyVariant(), title: "" }],
    }));
  };

  const removeVariant = (index: number) => {
    const v = form.variants[index];
    if (v.imagePreview) URL.revokeObjectURL(v.imagePreview);
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

  const addInfo = () => {
    setForm((f) => ({
      ...f,
      additionalInfo: [
        ...f.additionalInfo,
        { title: "", description: "", order: f.additionalInfo.length },
      ],
    }));
  };

  const handleInfoChange = (
    index: number,
    field: keyof ProductInfo,
    value: string,
  ) => {
    setForm((f) => {
      const updated = [...f.additionalInfo];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, additionalInfo: updated };
    });
  };

  const removeInfo = (index: number) => {
    setForm((f) => ({
      ...f,
      additionalInfo: f.additionalInfo.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (!val || form.tags.includes(val)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, val] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("La description est requise.");
      return;
    }
    if (dialogMode === "create" && !form.coverImage) {
      toast.error("Une image de couverture est requise.");
      return;
    }
    if (form.variants.length === 0) {
      toast.error("Au moins une variante est requise.");
      return;
    }

    setSubmitting(true);
    try {
      const maybeAppend = (
        fd: FormData,
        key: string,
        value: string | null | undefined,
      ) => {
        const trimmed = value?.trim();
        if (trimmed) fd.append(key, trimmed);
      };

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      maybeAppend(fd, "subtitle", form.subtitle);
      maybeAppend(fd, "ribbonText", form.ribbonText);
      maybeAppend(fd, "artist", form.artist);
      maybeAppend(fd, "onlineStoreId", form.onlineStoreId);
      fd.append("purchasable", form.purchasable);
      fd.append("status", form.status);

      if (form.coverImage instanceof File && form.coverImage.size > 0)
        fd.append("coverImage", form.coverImage);

      const variantsPayload = form.variants.map(
        ({ imageFile, imagePreview, ...rest }) => rest,
      );
      fd.append("variants", JSON.stringify(variantsPayload));
      fd.append("additionalInfo", JSON.stringify(form.additionalInfo));
      fd.append("tags", JSON.stringify(form.tags));

      const res = await apiServerClient.fetch(
        dialogMode === "edit"
          ? `/store/products/${editTarget!.id}`
          : "/store/products",
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

      const savedProduct: Product = await res.json();

      if (form.galleryImages.length > 0) {
        const galleryFd = new FormData();
        form.galleryImages.forEach((file) => galleryFd.append("images", file));
        const galleryRes = await apiServerClient.fetch(
          `/store/products/${savedProduct.id}/images`,
          { method: "POST", body: galleryFd, credentials: "include" },
        );
        if (!galleryRes.ok)
          toast.error("Certaines images galerie n'ont pas pu être uploadées.");
      }

      const variantsWithFiles = form.variants
        .map((v, i) => ({ v, i }))
        .filter(({ v }) => v.imageFile);

      if (variantsWithFiles.length > 0) {
        const freshRes = await apiServerClient.fetch(
          `/store/products/${savedProduct.id}`,
          { credentials: "include" },
        );
        if (freshRes.ok) {
          const freshProduct: Product = await freshRes.json();
          await Promise.all(
            variantsWithFiles.map(async ({ v, i }) => {
              const variantId = freshProduct.variants[i]?.id;
              if (!variantId || !v.imageFile) return;
              const variantFd = new FormData();
              variantFd.append("image", v.imageFile);
              const variantRes = await apiServerClient.fetch(
                `/store/products/${savedProduct.id}/variants/${variantId}/image`,
                {
                  method: "POST",
                  body: variantFd,
                  credentials: "include",
                },
              );
              if (!variantRes.ok)
                toast.error(`Image du variant "${v.title}" non uploadée.`);
            }),
          );
        }
      }

      toast.success(
        dialogMode === "edit" ? "Produit mis à jour." : "Produit ajouté.",
      );
      closeDialog();
      await fetchProducts();
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
      const res = await apiServerClient.fetch(
        `/store/products/${deleteTarget.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok && res.status !== 204) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Produit supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Boutique</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {products.length} produit{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl gap-3">
            <PackagePlus className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              Aucun produit pour l'instant.
            </p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Ajouter le premier produit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => openEdit(product)}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit"
                ? "Modifier le produit"
                : "Ajouter un produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Image de couverture
                {dialogMode === "create" && (
                  <span className="text-destructive"> *</span>
                )}
              </label>
              {form.coverPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={form.coverPreview}
                    alt="cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={clearCover}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-black transition-colors z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                  <ImagePlus className="w-7 h-7" />
                  <span className="text-sm">
                    Cliquer pour choisir une image
                  </span>
                  <span className="text-xs opacity-70">
                    JPG, PNG, WEBP — max 10 MB
                  </span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
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
                placeholder="Nom du produit"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Sous-titre{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </label>
              <Input
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                placeholder="Sous-titre court"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description complète du produit…"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Ruban{" "}
                  <span className="text-muted-foreground font-normal">
                    (optionnel)
                  </span>
                </label>
                <Input
                  value={form.ribbonText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ribbonText: e.target.value }))
                  }
                  placeholder="Ex: Nouveau, Promo…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Artiste{" "}
                  <span className="text-muted-foreground font-normal">
                    (optionnel)
                  </span>
                </label>
                <Input
                  value={form.artist}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, artist: e.target.value }))
                  }
                  placeholder="Nom de l'artiste"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as ProductStatus }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Achetable</label>
                <Select
                  value={form.purchasable}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      purchasable: v as "true" | "false",
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ID boutique en ligne{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </label>
              <Input
                value={form.onlineStoreId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, onlineStoreId: e.target.value }))
                }
                placeholder="ID externe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Ajouter un tag…"
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  className="h-8 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-0.5"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowVariants((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-medium py-2 border-b border-border"
              >
                <span>Variantes ({form.variants.length})</span>
                {showVariants ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {showVariants && (
                <div className="space-y-3 pt-1">
                  {form.variants.map((variant, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3 space-y-3 bg-muted/20"
                    >
                      <VariantRow
                        variant={variant}
                        index={i}
                        onChange={handleVariantChange}
                        onRemove={removeVariant}
                        canRemove={form.variants.length > 1}
                      />

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Image du variant{" "}
                          <span className="font-normal">(optionnel)</span>
                        </label>
                        {(variant.imagePreview ?? variant.imageUrl) ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={variant.imagePreview ?? variant.imageUrl!}
                              alt={`variant ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => clearVariantImage(i)}
                              className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) =>
                                handleVariantImageChange(
                                  i,
                                  e as unknown as React.ChangeEvent<HTMLInputElement>,
                                );
                              input.click();
                            }}
                            className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground"
                          >
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-[10px] text-center leading-tight px-1">
                              Ajouter image
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="w-full gap-1.5 h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une variante
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowGallery((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-medium py-2 border-b border-border"
              >
                <span className="flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" />
                  Images galerie (
                  {form.existingGalleryImages.length +
                    form.galleryImages.length}
                  )
                </span>
                {showGallery ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {showGallery && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-4 gap-2">
                    {form.existingGalleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                      >
                        <img
                          src={img.url}
                          alt="gallery"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeExistingGallery(img)}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {form.galleryPreviews.map((preview, i) => (
                      <div
                        key={`new-${i}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-primary/40 bg-muted"
                      >
                        <img
                          src={preview}
                          alt={`new gallery ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeGalleryNew(i)}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-primary-foreground rounded px-1 py-0.5 leading-none">
                          Nouveau
                        </span>
                      </div>
                    ))}

                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px]">Ajouter</span>
                    </button>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryAdd}
                  />

                  <p className="text-xs text-muted-foreground">
                    Les nouvelles images seront uploadées à la sauvegarde.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowInfo((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-medium py-2 border-b border-border"
              >
                <span>
                  Informations supplémentaires ({form.additionalInfo.length})
                </span>
                {showInfo ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {showInfo && (
                <div className="space-y-2 pt-1">
                  {form.additionalInfo.map((info, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3 space-y-2 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Section {i + 1}
                        </span>
                        <button
                          onClick={() => removeInfo(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Input
                        placeholder="Titre de la section"
                        value={info.title}
                        onChange={(e) =>
                          handleInfoChange(i, "title", e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                      <Textarea
                        placeholder="Contenu…"
                        value={info.description}
                        onChange={(e) =>
                          handleInfoChange(i, "description", e.target.value)
                        }
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInfo}
                    className="w-full gap-1.5 h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une section
                  </Button>
                </div>
              )}
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
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleteTarget?.title}» sera définitivement supprimé, ainsi que
              toutes ses images. Cette action est irréversible.
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
