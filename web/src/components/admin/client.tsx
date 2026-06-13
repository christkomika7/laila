import apiServerClient from "#/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getCountry } from "#/lib/helpers";
import type { ClientRow } from "#/types/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TYPE_CONFIG } from "#/lib/constant";
import { formatCurrency } from "#/lib/utils";
import { ClientDetailDialog } from "../ui/client-dialog";

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

          <div className="flex items-center gap-2">
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun (Single)</SelectItem>
                {[
                  { value: "ALL", label: "Tous les types" },
                  { value: "both", label: "User + Client" },
                  { value: "user", label: "Utilisateur" },
                  { value: "customer", label: "Client" },
                ].map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun (Single)</SelectItem>
                {[
                  { value: "ALL", label: "Toutes les dates" },
                  { value: "7", label: "7 derniers jours" },
                  { value: "30", label: "30 derniers jours" },
                  { value: "90", label: "3 derniers mois" },
                  { value: "365", label: "Cette année" },
                ].map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
