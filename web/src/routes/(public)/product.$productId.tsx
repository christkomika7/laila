import Header from "#/components/header";
import { Button } from "#/components/ui/button";
import apiServerClient from "#/lib/api";
import { formatXAF } from "#/lib/utils";
import type { Product, ProductVariant } from "#/types/product";
import { useCartStore } from "#/store/use-cart-store";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

export const Route = createFileRoute("/(public)/product/$productId")({
  head: ({ params }) => ({
    title: `Produit ${params.productId} - Boutique Laïla`,
    meta: [{ property: "og:title", content: "Boutique Laïla" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { productId: id } = useParams({ from: "/(public)/product/$productId" });

  const items = useCartStore.use.items();
  const addProduct = useCartStore.use.addProduct();
  const removeItem = useCartStore.use.removeItem();
  const updateQuantity = useCartStore.use.updateQuantity();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentImageIndex(0);
        setQuantity(1);
        const res = await apiServerClient.fetch(`/store/products/${id}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: Product = await res.json();
        setProduct(data);
        setSelectedVariant(data.variants?.[0] ?? null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Produit introuvable ou erreur serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const cartKey =
    product && selectedVariant?.id
      ? `product:${product.id}:${selectedVariant.id}`
      : null;

  const cartItem = cartKey ? items.find((i) => i.id === cartKey) : null;
  const alreadyInCart = !!cartItem;

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) return;
    const stock = selectedVariant.inventoryQuantity;
    if (selectedVariant.manageInventory && quantity > stock) {
      toast.error(`Stock insuffisant — seulement ${stock} disponible(s).`);
      return;
    }
    if (alreadyInCart && cartKey) {
      updateQuantity(cartKey, quantity);
      toast.success(`Quantité mise à jour : ${quantity} × ${product.title}`);
      return;
    }
    addProduct(product, selectedVariant);
    if (quantity > 1 && cartKey) updateQuantity(cartKey, quantity);
    toast.success(`${quantity} × ${product.title} ajouté au panier.`);
  }, [
    product,
    selectedVariant,
    quantity,
    alreadyInCart,
    cartKey,
    addProduct,
    updateQuantity,
  ]);

  const handleRemoveFromCart = useCallback(() => {
    if (!cartKey || !product) return;
    removeItem(cartKey);
    toast.info(`${product.title} retiré du panier`);
  }, [cartKey, product, removeItem]);

  const allImages = product
    ? [
        ...(product.coverImage ? [{ url: product.coverImage }] : []),
        ...(product.images ?? []),
      ]
    : [];

  const handleVariantSelect = useCallback(
    (variant: ProductVariant) => {
      setSelectedVariant(variant);
      setQuantity(1);
      if (variant.imageUrl) {
        const idx = allImages.findIndex((img) => img.url === variant.imageUrl);
        if (idx !== -1) setCurrentImageIndex(idx);
      }
    },
    [allImages],
  );

  const handleQuantityChange = useCallback(
    (delta: number) => {
      const stock = selectedVariant?.inventoryQuantity ?? Infinity;
      const managed = selectedVariant?.manageInventory ?? false;
      setQuantity((prev) => {
        const next = prev + delta;
        if (next < 1) return 1;
        if (managed && next > stock) return stock;
        return next;
      });
    },
    [selectedVariant],
  );

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1,
    );
  }, [allImages.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-[#0a0a0a]">
        <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !product || !selectedVariant) {
    return (
      <div className="max-w-5xl mx-auto pt-32 px-4 bg-[#0a0a0a] min-h-screen">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>
        <div className="text-center text-neutral-400 p-8 bg-[#111] rounded-2xl border border-neutral-800/60">
          <XCircle className="mx-auto h-16 w-16 mb-4 opacity-30" />
          <p className="mb-6">{error ?? "Produit introuvable."}</p>
        </div>
      </div>
    );
  }

  const exactPrice =
    selectedVariant.salePriceInCents ?? selectedVariant.priceInCents;
  const originalPrice = selectedVariant.salePriceInCents
    ? selectedVariant.priceInCents
    : null;
  const priceDisplay = formatXAF(exactPrice);
  const originalPriceDisplay = originalPrice ? formatXAF(originalPrice) : null;

  const availableStock = selectedVariant.inventoryQuantity;
  const isStockManaged = selectedVariant.manageInventory;
  const canAddToCart = !isStockManaged || quantity <= availableStock;
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-24 px-4">
      <Header />
      <div className="max-w-6xl mx-auto">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-300 transition-colors mb-10 font-medium text-sm"
        >
          <ArrowLeft size={15} /> Retour à la boutique
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ── Galerie ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-neutral-800/70 aspect-4/5 bg-[#111]">
              <img
                src={currentImage?.url || placeholderImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full transition-all ring-1 ring-white/10"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full transition-all ring-1 ring-white/10"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {product.ribbonText && (
                <div className="absolute top-3 left-3 bg-amber-500 text-[#0a0a0a] text-xs font-bold px-3 py-1.5 rounded-full">
                  {product.ribbonText}
                </div>
              )}

              {alreadyInCart && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/70 text-green-400 border border-green-800/50">
                  <Check size={11} /> Dans le panier
                </span>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 justify-center lg:justify-start">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? "ring-2 ring-amber-500/60 scale-105"
                        : "ring-1 ring-neutral-800/80 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={image.url || placeholderImage}
                      alt={`${product.title} vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Infos ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-50 mb-2 tracking-tight">
              {product.title}
            </h1>

            {product.subtitle && (
              <p className="text-base text-neutral-500 mb-5">
                {product.subtitle}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800/70 text-neutral-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-baseline gap-4 py-5 border-y border-neutral-800/60 mb-6">
              <span className="text-3xl font-bold font-mono text-amber-400 tracking-tight">
                {priceDisplay}
              </span>
              {originalPriceDisplay && (
                <span className="text-xl text-neutral-600 line-through font-mono">
                  {originalPriceDisplay}
                </span>
              )}
            </div>

            {product.variants.length > 1 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-3">
                  Style
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const vKey = variant.id
                      ? `product:${product.id}:${variant.id}`
                      : null;
                    const vInCart = vKey
                      ? items.some((i) => i.id === vKey)
                      : false;
                    const isSelected = selectedVariant.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`relative h-10 px-5 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-neutral-800 text-neutral-50 border-neutral-600"
                            : "bg-[#111] border-neutral-800/60 text-neutral-500 hover:border-neutral-600 hover:text-neutral-200"
                        }`}
                      >
                        {variant.title}
                        {vInCart && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="prose prose-invert prose-sm text-neutral-400 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {(product.additionalInfo?.length ?? 0) > 0 && (
              <div className="mb-6 space-y-5">
                {[...product.additionalInfo]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((info) => (
                    <div
                      key={info.id}
                      className="border-l-2 border-neutral-700/60 pl-4"
                    >
                      <h3 className="text-sm font-semibold text-neutral-200 mb-1.5">
                        {info.title}
                      </h3>
                      <div
                        className="prose prose-invert prose-sm text-neutral-500"
                        dangerouslySetInnerHTML={{ __html: info.description }}
                      />
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-auto pt-5 border-t border-neutral-800/60 space-y-4">
              {/* Bannière panier */}
              {alreadyInCart && cartItem && (
                <div className="flex items-center justify-between bg-green-950/30 border border-neutral-800/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-green-400/90">
                    <Package size={14} />
                    <span>Dans le panier</span>
                    <span className="bg-green-900/50 border border-neutral-700/40 text-green-300 text-xs font-medium px-2 py-0.5 rounded-md">
                      × {cartItem.quantity}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveFromCart}
                    className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-red-400 border border-neutral-800/60 hover:border-red-900/50 hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                    Retirer
                  </button>
                </div>
              )}

              {/* Stock */}
              <div className="text-sm">
                {isStockManaged && canAddToCart && product.purchasable && (
                  <p className="text-green-500/80 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {availableStock} en stock
                  </p>
                )}
                {isStockManaged && !canAddToCart && product.purchasable && (
                  <p className="text-amber-500/80 flex items-center gap-2">
                    <XCircle size={14} />
                    Stock insuffisant — {availableStock} disponible(s)
                  </p>
                )}
                {!product.purchasable && (
                  <p className="text-neutral-600 flex items-center gap-2">
                    <XCircle size={14} />
                    Actuellement indisponible
                  </p>
                )}
              </div>

              {/* Quantité + bouton */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#111] border border-neutral-800/60 rounded-xl p-1 h-12">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-neutral-50 font-bold text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || !product.purchasable}
                  className={`flex-1 h-12 font-semibold text-base rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] border-none disabled:opacity-40 disabled:cursor-not-allowed ${
                    alreadyInCart
                      ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
                      : "bg-amber-500 hover:bg-amber-400 text-[#0a0a0a]"
                  }`}
                >
                  {alreadyInCart ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Mettre à jour ({quantity})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Ajouter au panier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
