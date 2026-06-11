import type { ProductVariant } from "#/types/product";
import { X } from "lucide-react";
import { Input } from "./input";

export function VariantRow({
  variant,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  variant: ProductVariant;
  index: number;
  onChange: (index: number, v: Partial<ProductVariant>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Variante {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <Input
        placeholder="Titre (ex: Taille M)"
        value={variant.title}
        onChange={(e) => onChange(index, { title: e.target.value })}
        className="h-8 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-muted-foreground">
            Prix (centimes)
          </label>
          <Input
            type="number"
            min={0}
            value={variant.priceInCents}
            onChange={(e) =>
              onChange(index, { priceInCents: Number(e.target.value) })
            }
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">
            Prix soldé (optionnel)
          </label>
          <Input
            type="number"
            min={0}
            value={variant.salePriceInCents ?? ""}
            onChange={(e) =>
              onChange(index, {
                salePriceInCents: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Stock</label>
          <Input
            type="number"
            min={0}
            value={variant.inventoryQuantity}
            onChange={(e) =>
              onChange(index, { inventoryQuantity: Number(e.target.value) })
            }
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">SKU</label>
          <Input
            placeholder="SKU"
            value={variant.sku ?? ""}
            onChange={(e) => onChange(index, { sku: e.target.value || null })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
