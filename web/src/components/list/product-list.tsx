import type { Product } from "#/types/product";
import apiServerClient from "#/lib/api";
import { Loader2, Music, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import ProductCard from "../card/product-card";

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiServerClient.fetch("/store/products");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: Product[] = await res.json();
      setProducts(data);

      const max = data.reduce((acc, p) => {
        const price =
          p.variants?.[0]?.salePriceInCents ??
          p.variants?.[0]?.priceInCents ??
          0;
        return Math.max(acc, price);
      }, 0);
      const maxXAF = Math.ceil(max);
      setMaxPrice(maxXAF);
      setPriceRange([0, maxXAF]);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Échec du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [products]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters =
    selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price =
        p.variants?.[0]?.salePriceInCents ?? p.variants?.[0]?.priceInCents ?? 0;

      const inPrice = price >= priceRange[0] && price <= priceRange[1];
      const inTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => p.tags?.includes(tag));

      return inPrice && inTags;
    });
  }, [products, selectedTags, priceRange]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl">
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-2 text-sm text-destructive underline hover:no-underline"
        >
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border border-border">
        <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-bold mb-2 font-display">
          Aucun produit disponible
        </h2>
        <p className="text-muted-foreground">
          Revenez bientôt pour découvrir nos nouveautés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} produit
          {filteredProducts.length !== 1 ? "s" : ""}
          {hasActiveFilters && " filtrés"}
        </p>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
            >
              <X className="h-3 w-3" /> Effacer les filtres
            </button>
          )}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center gap-2 text-sm font-medium border rounded-full px-4 py-1.5 transition-colors ${
              filtersOpen || hasActiveFilters
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="bg-primary-foreground/20 text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {selectedTags.length +
                  (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          {maxPrice > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Prix</h3>
                <span className="text-xs text-muted-foreground">
                  {formatXAF(priceRange[0])} — {formatXAF(priceRange[1])}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8">Min</span>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={100}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= priceRange[1])
                        setPriceRange([val, priceRange[1]]);
                    }}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-medium w-20 text-right">
                    {formatXAF(priceRange[0])}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8">Max</span>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= priceRange[0])
                        setPriceRange([priceRange[0], val]);
                    }}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-medium w-20 text-right">
                    {formatXAF(priceRange[1])}
                  </span>
                </div>
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-border">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground text-sm">
            Aucun produit ne correspond à ces filtres.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-primary underline hover:no-underline"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
