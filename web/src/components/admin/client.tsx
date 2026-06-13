import apiServerClient from "#/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  ChevronDown,
  Download,
  Globe,
  Loader2,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getCountry } from "#/lib/helpers";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClientRow {
  id: string;
  type: "user" | "customer" | "both";
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  role: string | null;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenueInCents: number;
  downloadCount: number;
  lastOrderAt: string | null;
}

interface ClientDetail {
  user: any;
  customer: any;
  type: string;
  orders: any[];
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

const TYPE_CONFIG = {
  both: {
    label: "User + Client",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  user: {
    label: "Utilisateur",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  customer: {
    label: "Client",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  COMPLETED: { label: "Payé", className: "bg-emerald-500/10 text-emerald-400" },
  PENDING: { label: "En attente", className: "bg-amber-500/10 text-amber-400" },
  PROCESSING: { label: "En cours", className: "bg-blue-500/10 text-blue-400" },
  FAILED: { label: "Échoué", className: "bg-red-500/10 text-red-400" },
  CANCELLED: {
    label: "Annulé",
    className: "bg-neutral-500/10 text-neutral-400",
  },
  REFUNDED: {
    label: "Remboursé",
    className: "bg-purple-500/10 text-purple-400",
  },
};

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

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function ClientDetailDialog({
  client,
  open,
  onClose,
}: {
  client: ClientRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !client) return;
    setLoading(true);
    apiServerClient
      .fetch(
        `/admin/clients/${client.id}?type=${client.type === "customer" ? "customer" : "user"}`,
        {
          credentials: "include",
        },
      )
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [open, client]);

  if (!client) return null;

  const typeCfg = TYPE_CONFIG[client.type];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {client.name ?? "Sans nom"}
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                {client.email}
              </p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${typeCfg.className}`}
            >
              {typeCfg.label}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Infos de base */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {[
            { icon: Mail, label: "Email", value: client.email },
            { icon: Phone, label: "Téléphone", value: client.phone ?? "—" },
            { icon: Globe, label: "Pays", value: client.country ?? "—" },
            {
              icon: ShoppingBag,
              label: "Commandes",
              value: `${client.completedOrders} / ${client.totalOrders}`,
            },
            {
              icon: Download,
              label: "Téléchargements",
              value: String(client.downloadCount),
            },
            {
              icon: Users,
              label: "Membre depuis",
              value: format(new Date(client.createdAt), "dd/MM/yyyy"),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="p-3 rounded-md border border-border bg-background/50"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-sm font-medium text-foreground truncate">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Revenu total */}
        <div className="p-4 rounded-md border border-border bg-amber-500/5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Revenu total généré</p>
          <p className="text-xl font-bold text-amber-400 font-mono">
            {formatCurrency(client.totalRevenueInCents)}
          </p>
        </div>

        {/* Commandes */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : detail && detail.orders.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Historique des commandes
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {detail.orders.map((order) => {
                const st =
                  PAYMENT_STATUS_CONFIG[order.payment?.status ?? "PENDING"] ??
                  PAYMENT_STATUS_CONFIG.PENDING;
                return (
                  <div
                    key={order.orderId}
                    className="p-3 rounded-md border border-border bg-background/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-foreground">
                        #{order.orderId.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(order.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                        {" · "}
                        {order.items.length} article
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {formatCurrency(order.totalInCents, order.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune commande.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminClient() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);

  useEffect(() => {
    apiServerClient
      .fetch("/admin/clients", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setClients(Array.isArray(d) ? d : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          (c.name ?? "").toLowerCase().includes(q) ||
          (c.country ?? "").toLowerCase().includes(q),
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter((c) => c.type === typeFilter);
    }

    if (dateFilter !== "ALL") {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((c) => new Date(c.createdAt) >= cutoff);
    }

    return result;
  }, [clients, search, typeFilter, dateFilter]);

  const hasFilters = search || typeFilter !== "ALL" || dateFilter !== "ALL";

  if (loading) {
    return (
      <div className="bg-card rounded-md p-6 border border-border flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-md p-6 shadow-sm border border-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Clients</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {clients.length} client{clients.length > 1 ? "s" : ""} au total
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 pl-9 pr-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring w-48"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "ALL", label: "Tous les types" },
                { value: "both", label: "User + Client" },
                { value: "user", label: "Utilisateur" },
                { value: "customer", label: "Client" },
              ]}
            />

            <Select
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: "ALL", label: "Toutes les dates" },
                { value: "7", label: "7 derniers jours" },
                { value: "30", label: "30 derniers jours" },
                { value: "90", label: "3 derniers mois" },
                { value: "365", label: "Cette année" },
              ]}
            />

            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setDateFilter("ALL");
                }}
                className="flex items-center gap-1 h-9 px-3 rounded-md border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead className="text-right">Commandes</TableHead>
                <TableHead className="text-right">Téléch.</TableHead>
                <TableHead className="text-right">Revenu</TableHead>
                <TableHead>Dernière commande</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => {
                  const typeCfg = TYPE_CONFIG[client.type];
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {client.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {client.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeCfg.className}`}
                        >
                          {typeCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {getCountry(client.country || "—")}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        <span className="text-foreground">
                          {client.completedOrders}
                        </span>
                        <span className="text-muted-foreground">
                          /{client.totalOrders}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {client.downloadCount}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono font-semibold text-amber-400">
                        {formatCurrency(client.totalRevenueInCents)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.lastOrderAt
                          ? format(new Date(client.lastOrderAt), "dd/MM/yyyy", {
                              locale: fr,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                          Infos
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ClientDetailDialog
        client={selectedClient}
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </>
  );
}
