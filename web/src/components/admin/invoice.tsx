import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
import { toast } from "sonner";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { apiServerClient } from "#/lib/api";

type InvoiceItem = {
  title: string;
  quantity: number;
  unitPriceInCents: number;
  coverUrl?: string;
};

type Invoice = {
  id: string;
  type: "payment" | "donation";
  status: string;
  provider: string;
  totalInCents: number;
  currency: string;
  createdAt: string;
  completedAt: string | null;
  items?: InvoiceItem[];
  customer?: {
    name: string | null;
    email: string | null;
    country?: string;
  } | null;
  user?: { name: string | null; email: string | null } | null;
  hide?: boolean;
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Payée",
  PENDING: "En attente",
  FAILED: "Échouée",
  PROCESSING: "En cours",
  CANCELLED: "Annulée",
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const typeLabels: Record<string, string> = {
  payment: "Paiement",
  donation: "Don",
};

export default function AdminInvoiceTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [detailTarget, setDetailTarget] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch("/invoices?limit=100", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      setInvoices(list);
    } catch {
      toast.error("Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchInvoices();
  });

  const getClientName = (invoice: Invoice) => {
    return (
      invoice.user?.name ||
      invoice.customer?.name ||
      invoice.user?.email ||
      invoice.customer?.email ||
      "N/A"
    );
  };

  const getClientEmail = (invoice: Invoice) => {
    return invoice.user?.email || invoice.customer?.email || "N/A";
  };

  const getType = (invoice: Invoice) => {
    return invoice.type === "donation" ? "Don" : "Achat";
  };

  const formatPrice = (cents: number, currency: string) => {
    return `${Math.round(cents).toLocaleString("fr-FR")} ${currency}`;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const date = new Date(invoice.createdAt);
    if (startDate && date < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    if (statusFilter !== "ALL" && invoice.status !== statusFilter) return false;
    return true;
  });

  const hasActiveFilters = startDate || endDate || statusFilter !== "ALL";

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await apiServerClient.fetch(
        `/invoices/${deleteTarget.type}/${deleteTarget.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok && res.status !== 204) throw new Error();
      setInvoices((prev) =>
        prev.filter(
          (inv) =>
            !(inv.id === deleteTarget.id && inv.type === deleteTarget.type),
        ),
      );
      toast.success("Facture supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-md p-6 shadow-sm border border-border overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Toutes les Factures</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredInvoices.length} facture
              {filteredInvoices.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Du</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Au</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground underline self-end mb-0.5 hover:text-foreground"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    Aucune facture trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={`${invoice.type}-${invoice.id}`}>
                    <TableCell className="font-medium text-foreground">
                      {getClientName(invoice)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getClientEmail(invoice)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getType(invoice)}
                    </TableCell>
                    <TableCell className="font-mono text-primary">
                      {formatPrice(invoice.totalInCents, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusStyles[invoice.status] ||
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailTarget(invoice)}
                          className="size-9!"
                        >
                          <Eye className="size-4!" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(invoice)}
                          className="size-8!"
                        >
                          <Trash2 className="size-4!" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal détails facture */}
      <Dialog
        open={detailTarget !== null}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la facture</DialogTitle>
          </DialogHeader>

          {detailTarget && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                  <p className="font-medium">
                    {typeLabels[detailTarget.type] || detailTarget.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Statut</p>
                  <Badge
                    variant="outline"
                    className={
                      statusStyles[detailTarget.status] ||
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {statusLabels[detailTarget.status] || detailTarget.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Fournisseur
                  </p>
                  <p className="font-medium">{detailTarget.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Montant
                  </p>
                  <p className="font-mono font-medium text-primary">
                    {formatPrice(
                      detailTarget.totalInCents,
                      detailTarget.currency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Créée le
                  </p>
                  <p className="font-medium">
                    {new Date(detailTarget.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Complétée le
                  </p>
                  <p className="font-medium">
                    {detailTarget.completedAt
                      ? new Date(detailTarget.completedAt).toLocaleString(
                          "fr-FR",
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Client
                </p>
                <p>
                  <span className="text-muted-foreground">Nom: </span>
                  {getClientName(detailTarget)}
                </p>
                <p>
                  <span className="text-muted-foreground">Email: </span>
                  {getClientEmail(detailTarget)}
                </p>
                {detailTarget.customer?.country && (
                  <p>
                    <span className="text-muted-foreground">Pays: </span>
                    {detailTarget.customer.country}
                  </p>
                )}
              </div>

              {detailTarget.items && detailTarget.items.length > 0 && (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Articles ({detailTarget.items.length})
                  </p>
                  <div className="space-y-2">
                    {detailTarget.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border p-2 bg-muted/20"
                      >
                        {item.coverUrl && (
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded object-cover border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(
                              item.unitPriceInCents,
                              detailTarget.currency,
                            )}{" "}
                            × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-mono text-primary whitespace-nowrap">
                          {formatPrice(
                            item.unitPriceInCents * item.quantity,
                            detailTarget.currency,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm font-mono font-semibold text-primary">
                      {formatPrice(
                        detailTarget.totalInCents,
                        detailTarget.currency,
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDetailTarget(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              La facture de «{deleteTarget ? getClientName(deleteTarget) : ""}»
              sera définitivement supprimée. Cette action est irréversible.
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
