import type { Product, ProductVariant } from "#/types/product";
import { Pencil, ShoppingBag, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { statusLabel, statusVariant } from "#/lib/constant";
import { formatPrice } from "#/lib/utils";

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const lowestVariant = product.variants.reduce<ProductVariant | null>(
    (min, v) => (!min || v.priceInCents < min.priceInCents ? v : min),
    null,
  );

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.coverImage ? (
          <img
            src={`${product.coverImage}`}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ShoppingBag className="w-10 h-10" />
          </div>
        )}
        {product.ribbonText && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {product.ribbonText}
          </span>
        )}
        <Badge
          variant={statusVariant[product.status]}
          className="absolute top-2 right-2 text-[10px]"
        >
          {statusLabel[product.status]}
        </Badge>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1">
          {product.title}
        </p>
        {product.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.subtitle}
          </p>
        )}
        {lowestVariant && (
          <p className="text-xs font-medium text-primary mt-0.5">
            {lowestVariant.salePriceInCents ? (
              <>
                <span className="line-through text-muted-foreground mr-1">
                  {formatPrice(
                    lowestVariant.priceInCents,
                    lowestVariant.currency,
                  )}
                </span>
                {formatPrice(
                  lowestVariant.salePriceInCents,
                  lowestVariant.currency,
                )}
              </>
            ) : (
              formatPrice(lowestVariant.priceInCents, lowestVariant.currency)
            )}
          </p>
        )}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Modifier
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
