import type { ClientDetail, ClientRow } from "#/types/client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import apiServerClient from "#/lib/api";
import { Download, Globe, Loader2, Mail, Phone, ShoppingBag, User, Users } from "lucide-react";
import { PAYMENT_STATUS_CONFIG, TYPE_CONFIG } from "#/lib/constant";
import { format } from "date-fns";
import { formatCurrency } from "#/lib/utils";
import { fr } from "date-fns/locale/fr";


export function ClientDetailDialog({
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

        <div className="p-4 rounded-md border border-border bg-amber-500/5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Revenu total généré</p>
          <p className="text-xl font-bold text-amber-400 font-mono">
            {formatCurrency(client.totalRevenueInCents)}
          </p>
        </div>

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
