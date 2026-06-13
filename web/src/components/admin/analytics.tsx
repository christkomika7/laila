import apiServerClient from "#/lib/api";
import { formatCurrency } from "#/lib/utils";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  Disc3,
  Loader2,
  Music,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "../ui/custom-tooltip";
import { StatCard } from "../card/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Analytics } from "#/types/analytics";
import {
  DATE_PRESETS,
  GRAIN_OPTIONS,
  PAYMENT_STATUS_CONFIG,
} from "#/lib/constant";

export default function AdminAnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [grain, setGrain] = useState("day");
  const [activeChart, setActiveChart] = useState<"revenue" | "orders">(
    "revenue",
  );

  useEffect(() => {
    setLoading(true);
    const from = subDays(new Date(), days).toISOString();
    const to = new Date().toISOString();
    apiServerClient
      .fetch(`/admin/analytics?from=${from}&to=${to}&grain=${grain}`, {
        credentials: "include",
      })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days, grain]);

  const conversionRate = data
    ? data.totals.orders > 0
      ? ((data.totals.completedOrders / data.totals.orders) * 100).toFixed(1)
      : "0"
    : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Revenu total"
          value={data ? formatCurrency(data.totals.revenueInCents) : "—"}
          sub={
            data
              ? `Stripe ${formatCurrency(data.totals.stripeRevenueInCents)} · MoMo ${formatCurrency(data.totals.pawapayRevenueInCents)}`
              : undefined
          }
          accent
        />
        <StatCard
          icon={ShoppingBag}
          label="Commandes"
          value={data ? String(data.totals.orders) : "—"}
          sub={
            data
              ? `${data.totals.completedOrders} complétées · ${conversionRate}% conv.`
              : undefined
          }
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={data ? String(data.totals.users + data.totals.customers) : "—"}
          sub={
            data
              ? `${data.totals.users} comptes · ${data.totals.customers} anonymes`
              : undefined
          }
        />
        <StatCard
          icon={TrendingUp}
          label="Période en cours"
          value={data ? formatCurrency(data.period.revenueInCents) : "—"}
          sub={
            data
              ? `${data.period.completedOrders} ventes sur ${days}j`
              : undefined
          }
        />
      </div>

      <div className="bg-card rounded-md p-6 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChart("revenue")}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${activeChart === "revenue" ? "bg-amber-500/10 text-amber-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Revenu
            </button>
            <button
              onClick={() => setActiveChart("orders")}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${activeChart === "orders" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Commandes
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md border border-border">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setDays(p.days)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${days === p.days ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Select value={grain} onValueChange={(e) => setGrain(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun (Single)</SelectItem>
                {GRAIN_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.period.timeSeries.length ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Aucune donnée sur cette période.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={data.period.timeSeries}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  try {
                    return format(
                      new Date(v),
                      grain === "month" ? "MMM" : "dd/MM",
                      { locale: fr },
                    );
                  } catch {
                    return v;
                  }
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={
                  activeChart === "revenue"
                    ? (v: number) => `${(v / 1000).toFixed(0)}k`
                    : undefined
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {activeChart === "revenue" ? (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenu"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Complétées"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    name="Échouées"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 2"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-md p-6 border border-border shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Top ventes
          </h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {(data?.topAlbums ?? []).map((album, i) => (
                <div key={album.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded bg-muted shrink-0 overflow-hidden">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Album</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-amber-400 shrink-0">
                    ×{album.soldCount}
                  </span>
                </div>
              ))}
              {(data?.topTracks ?? []).map((track, i) => (
                <div key={track.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">
                    {(data?.topAlbums.length ?? 0) + i + 1}
                  </span>
                  <div className="w-8 h-8 rounded bg-muted shrink-0 overflow-hidden">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Single</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-amber-400 shrink-0">
                    ×{track.soldCount}
                  </span>
                </div>
              ))}
              {!data?.topAlbums.length && !data?.topTracks.length && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune vente.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card rounded-md p-6 border border-border shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Commandes récentes
          </h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.recentOrders ?? []).map((order) => {
                const st =
                  PAYMENT_STATUS_CONFIG[order.paymentStatus] ??
                  PAYMENT_STATUS_CONFIG.PENDING;
                return (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-foreground">
                        #{order.orderId.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.client?.name ?? order.client?.email ?? "Invité"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {formatCurrency(order.totalInCents, order.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "dd/MM", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!data?.recentOrders.length && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune commande.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
