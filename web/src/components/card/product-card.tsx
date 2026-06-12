import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, ShoppingCart, X } from "lucide-react";
import ImageWithFallback from "../ui/image-with-fallback";
import PremiumButton from "../ui/premiem.button";
import type { Product } from "#/types/product";
import { toast } from "sonner";
import { formatXAF, getBasePrice } from "#/lib/utils";
import { useCartStore } from "#/store/use-cart-store";

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600";

const ProductCard = ({ product }: ProductCardProps) => {
  const items = useCartStore.use.items();
  const addProduct = useCartStore.use.addProduct();
  const removeItem = useCartStore.use.removeItem();

  const firstVariant = product.variants?.[0];
  const cartKey = firstVariant?.id
    ? `product:${product.id}:${firstVariant.id}`
    : null;
  const alreadyInCart = cartKey ? items.some((i) => i.id === cartKey) : false;

  const coverUrl =
    product.coverImage || product.images?.[0]?.url || FALLBACK_IMAGE;
  const priceDisplay = formatXAF(getBasePrice(product));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (alreadyInCart || !firstVariant) return;
    addProduct(product, firstVariant);
    toast.success(`« ${product.title} » ajouté au panier`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartKey) return;
    removeItem(cartKey);
    toast.info(`« ${product.title} » retiré du panier`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group rounded-lg border border-zinc-800/60 bg-[#0e0e0e] overflow-hidden hover:border-zinc-600/60 hover:bg-[#141414] transition-all duration-300"
    >
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="block relative aspect-square overflow-hidden"
      >
        <ImageWithFallback
          src={coverUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.ribbonText && (
          <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-[#0a0a0a] text-xs font-bold px-3 py-1 rounded-full">
            {product.ribbonText}
          </div>
        )}
        {alreadyInCart ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-green-600/90 text-white border border-green-500/60">
            <Check className="w-3 h-3" />
            Dans le panier
          </span>
        ) : (
          <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-sm text-zinc-100 text-xs font-bold px-3 py-1 rounded-full">
            {priceDisplay}
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col">
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="text-lg font-bold font-display text-zinc-100 truncate group-hover:text-white transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-zinc-500 mb-4 truncate">
            {product.artist ?? "Laïla"}
          </p>
        </Link>

        {alreadyInCart ? (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-green-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Ajouté
            </span>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600/60 bg-red-950/30 hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <X className="w-3 h-3" />
              Retirer
            </button>
          </div>
        ) : (
          <PremiumButton
            onClick={handleAddToCart}
            disabled={!firstVariant}
            className="w-full font-semibold border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-all"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </PremiumButton>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
