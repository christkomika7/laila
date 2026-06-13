import apiServerClient from "#/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { ChevronDown, Loader2, Package, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

interface OrderPayment {
  id: string;
  provider: "STRIPE" | "PAWAPAY";
  status: PaymentStatus;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  method: string;
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
  type: "track" | "album" | "product";
}

interface Order {
  orderId: string;
  createdAt: string;
  totalInCents: number;
  currency: string;
  orderStatus: string;
  payment: OrderPayment | null;
  items: OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(cents: number, currency = "XAF") {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents);
  } catch {
    return `${cents.toLocaleString("fr-FR")} ${currency}`;
  }
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Payé",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  PROCESSING: {
    label: "En cours",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  FAILED: {
    label: "Échoué",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  REFUNDED: {
    label: "Remboursé",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  CANCELLED: {
    label: "Annulé",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  },
};

const FILTER_STATUSES: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "COMPLETED", label: "Payé" },
  { value: "PENDING", label: "En attente" },
  { value: "PROCESSING", label: "En cours" },
  { value: "FAILED", label: "Échoué" },
  { value: "REFUNDED", label: "Remboursé" },
  { value: "CANCELLED", label: "Annulé" },
];

const DATE_RANGES: { value: string; label: string }[] = [
  { value: "ALL", label: "Toutes les dates" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "3 derniers mois" },
  { value: "365d", label: "Cette année" },
];

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserPurchaseTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">(
    "ALL",
  );
  const [dateFilter, setDateFilter] = useState("ALL");

  useEffect(() => {
    apiServerClient
      .fetch("/purchases", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...orders];

    // Filtre statut
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.payment?.status === statusFilter);
    }

    // Filtre date
    if (dateFilter !== "ALL") {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((o) => new Date(o.createdAt) >= cutoff);
    }

    return result;
  }, [orders, statusFilter, dateFilter]);

  const hasActiveFilters = statusFilter !== "ALL" || dateFilter !== "ALL";

  const resetFilters = () => {
    setStatusFilter("ALL");
    setDateFilter("ALL");
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Historique des Achats
        </h2>
        {orders.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as PaymentStatus | "ALL")}
              options={FILTER_STATUSES}
            />
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              options={DATE_RANGES}
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 h-9 px-3 rounded-md border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Vous n'avez pas encore effectué d'achats.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Aucune commande ne correspond aux filtres.
          </p>
          <button
            onClick={resetFilters}
            className="mt-3 text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const paymentStatus = order.payment?.status ?? "PENDING";
            const statusCfg =
              STATUS_CONFIG[paymentStatus] ?? STATUS_CONFIG.PENDING;
            const isExpanded = expanded === order.orderId;

            return (
              <div
                key={order.orderId}
                className="rounded-md border border-border bg-background/50 overflow-hidden"
              >
                {/* Order row */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : order.orderId)}
                  className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground font-mono text-sm">
                      #{order.orderId.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(
                        new Date(order.createdAt),
                        "dd MMMM yyyy · HH:mm",
                        { locale: fr },
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.items.length} article
                      {order.items.length > 1 ? "s" : ""}
                      {order.payment && (
                        <span className="ml-2 text-muted-foreground/60">
                          via{" "}
                          {order.payment.provider === "STRIPE"
                            ? "Carte"
                            : "Mobile Money"}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0">
                    <span className="font-bold text-foreground text-sm">
                      {formatCurrency(order.totalInCents, order.currency)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform hidden sm:block ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.type === "track"
                              ? "Single"
                              : item.type === "album"
                                ? "Album"
                                : "Produit"}
                            {item.quantity > 1 && ` × ${item.quantity}`}
                          </p>
                        </div>
                        <span className="text-muted-foreground font-mono text-xs ml-4 shrink-0">
                          {formatCurrency(
                            item.totalPriceInCents,
                            order.currency,
                          )}
                        </span>
                      </div>
                    ))}

                    {/* Payment detail */}
                    {order.payment && (
                      <div className="px-4 py-3 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{order.payment.method}</span>
                        {order.payment.paidAt && (
                          <span>
                            Payé le{" "}
                            {format(
                              new Date(order.payment.paidAt),
                              "dd/MM/yyyy",
                            )}
                          </span>
                        )}
                        {order.payment.failureReason && (
                          <span className="text-red-400">
                            {order.payment.failureReason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
