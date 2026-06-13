import Elysia, { t } from "elysia";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { formatAlbum, formatTrack } from "../../lib/helpers";

async function requireAdmin(request: Request, set: any) {
  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);
  if (!session) {
    set.status = 401;
    return { error: "Authentification requise." };
  }
  if (session.user.role !== "admin") {
    set.status = 403;
    return { error: "Accès refusé." };
  }
  return session;
}

export const adminStatsRoutes = new Elysia({ prefix: "/admin" })

  /**
   * GET /admin/clients
   * Liste unifiée users + customers avec stats par personne.
   * Un enregistrement peut être :
   *   - type "user"     : compte BetterAuth uniquement (jamais commandé en guest)
   *   - type "customer" : a commandé en guest (pas de compte)
   *   - type "both"     : compte BetterAuth ET customer lié par email
   */
  .get("/clients", async ({ request, set }) => {
    const session = await requireAdmin(request, set);
    if (!session || "error" in session) return session;

    // Charger tous les users et customers en parallèle
    const [users, customers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          role: true,
          createdAt: true,
          orders: {
            where: {},
            include: { payment: true, items: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          createdAt: true,
          orders: {
            include: { payment: true, items: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Index users par email pour le merge
    const usersByEmail = new Map(users.map((u) => [u.email, u]));
    const customersByEmail = new Map(customers.map((c) => [c.email, c]));

    function computeOrderStats(orders: any[]) {
      const completedOrders = orders.filter(
        (o) => o.payment?.status === "COMPLETED",
      );
      const totalRevenue = completedOrders.reduce(
        (sum, o) => sum + o.totalInCents,
        0,
      );
      const totalOrders = orders.length;
      const completedCount = completedOrders.length;

      // Nombre de téléchargements = items audio (tracks + albums) des commandes complétées
      const downloadCount = completedOrders.reduce((sum, o) => {
        return (
          sum +
          o.items.filter((i: any) => i.trackId !== null || i.albumId !== null)
            .length
        );
      }, 0);

      return { totalRevenue, totalOrders, completedCount, downloadCount };
    }

    // Construire la liste unifiée
    const allEmails = new Set([
      ...usersByEmail.keys(),
      ...customersByEmail.keys(),
    ]);

    const result = Array.from(allEmails).map((email) => {
      const user = usersByEmail.get(email);
      const customer = customersByEmail.get(email);

      const type = user && customer ? "both" : user ? "user" : "customer";

      // Fusionner les commandes sans doublons (par orderId)
      const allOrders = new Map<string, any>();
      (user?.orders ?? []).forEach((o: any) => allOrders.set(o.id, o));
      (customer?.orders ?? []).forEach((o: any) => allOrders.set(o.id, o));
      const orders = Array.from(allOrders.values());

      const stats = computeOrderStats(orders);

      return {
        id: user?.id ?? customer!.id,
        type,
        name: user?.name ?? customer?.name ?? null,
        email,
        phone: user?.phone ?? customer?.phone ?? null,
        country: user?.country ?? customer?.country ?? null,
        role: user?.role ?? null,
        createdAt: user?.createdAt ?? customer!.createdAt,
        // Stats
        totalOrders: stats.totalOrders,
        completedOrders: stats.completedCount,
        totalRevenueInCents: stats.totalRevenue,
        downloadCount: stats.downloadCount,
        // Dernière commande
        lastOrderAt:
          orders.length > 0
            ? orders.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0].createdAt
            : null,
      };
    });

    // Trier par date de création décroissante
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return result;
  })

  /**
   * GET /admin/clients/:id
   * Détail complet d'un client (user ou customer) avec toutes ses commandes.
   */
  .get(
    "/clients/:id",
    async ({ request, set, params, query }) => {
      const session = await requireAdmin(request, set);
      if (!session || "error" in session) return session;

      const { id } = params;
      const { type } = query; // "user" | "customer"

      let email: string | null = null;

      if (type === "user" || !type) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (user) email = user.email;
      }
      if (!email && (type === "customer" || !type)) {
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (customer) email = customer.email;
      }

      if (!email) {
        set.status = 404;
        return { error: "Client introuvable." };
      }

      const [user, customer] = await Promise.all([
        prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            role: true,
            createdAt: true,
          },
        }),
        prisma.customer.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            createdAt: true,
          },
        }),
      ]);

      // Toutes les commandes liées
      const orderFilter: any = { OR: [] };
      if (user) orderFilter.OR.push({ userId: user.id });
      if (customer) orderFilter.OR.push({ customerId: customer.id });

      const orders = await prisma.order.findMany({
        where: orderFilter,
        include: {
          payment: true,
          items: {
            include: {
              track: { select: { id: true, title: true } },
              album: { select: { id: true, title: true } },
              variant: {
                select: {
                  title: true,
                  product: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        user,
        customer,
        type: user && customer ? "both" : user ? "user" : "customer",
        orders: orders.map((o) => ({
          orderId: o.id,
          createdAt: o.createdAt,
          totalInCents: o.totalInCents,
          currency: o.currency,
          status: o.status,
          payment: o.payment
            ? {
                provider: o.payment.provider,
                status: o.payment.status,
                method:
                  o.payment.provider === "STRIPE"
                    ? `Carte ****${o.payment.cardLast4 ?? ""}`
                    : `Mobile Money — ${o.payment.correspondent ?? ""}`,
                completedAt: o.payment.completedAt,
              }
            : null,
          items: o.items.map((i) => ({
            title: i.title,
            type: i.trackId ? "track" : i.albumId ? "album" : "product",
            quantity: i.quantity,
            unitPriceInCents: i.unitPriceInCents,
            track: i.track ? formatTrack(i.track) : null,
            album: i.album ? formatAlbum(i.album) : null,
          })),
        })),
      };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(
        t.Object({
          type: t.Optional(t.Union([t.Literal("user"), t.Literal("customer")])),
        }),
      ),
    },
  )

  /**
   * GET /admin/analytics
   * Statistiques globales + séries temporelles pour graphiques.
   *
   * Query params:
   *   - from  : ISO date (défaut: 30 jours en arrière)
   *   - to    : ISO date (défaut: maintenant)
   *   - grain : "day" | "week" | "month" (défaut: "day")
   */
  .get(
    "/analytics",
    async ({ request, set, query }) => {
      const session = await requireAdmin(request, set);
      if (!session || "error" in session) return session;

      const to = query.to ? new Date(query.to) : new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      const grain = query.grain ?? "day";

      // ── Totaux globaux (all-time) ────────────────────────────────────────
      const [
        totalUsersCount,
        totalCustomersCount,
        allTimePayments,
        topTracks,
        topAlbums,
        recentOrders,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.customer.count(),
        prisma.payment.findMany({
          where: { status: "COMPLETED" },
          select: {
            provider: true,
            completedAt: true,
            order: { select: { totalInCents: true, currency: true } },
          },
        }),
        // Top 5 tracks les plus vendus
        prisma.orderItem.groupBy({
          by: ["trackId"],
          where: { trackId: { not: null } },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        // Top 5 albums les plus vendus
        prisma.orderItem.groupBy({
          by: ["albumId"],
          where: { albumId: { not: null } },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        // 10 dernières commandes
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            payment: { select: { status: true, provider: true } },
            customer: { select: { name: true, email: true } },
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

      // Toujours order.totalInCents — cohérent avec la période
      const allTimeRevenue = allTimePayments.reduce(
        (sum, p) => sum + (p.order?.totalInCents ?? 0),
        0,
      );
      const stripeRevenue = allTimePayments
        .filter((p) => p.provider === "STRIPE")
        .reduce((sum, p) => sum + (p.order?.totalInCents ?? 0), 0);
      const pawapayRevenue = allTimePayments
        .filter((p) => p.provider === "PAWAPAY")
        .reduce((sum, p) => sum + (p.order?.totalInCents ?? 0), 0);

      // ── Commandes dans la plage de dates ────────────────────────────────
      const periodOrders = await prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: { payment: true },
        orderBy: { createdAt: "asc" },
      });

      // ── Série temporelle ─────────────────────────────────────────────────
      function truncate(date: Date, g: string): string {
        const d = new Date(date);
        if (g === "month")
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (g === "week") {
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          d.setDate(diff);
          return d.toISOString().slice(0, 10);
        }
        return d.toISOString().slice(0, 10);
      }

      const buckets = new Map<
        string,
        { orders: number; revenue: number; completed: number; failed: number }
      >();

      for (const order of periodOrders) {
        const key = truncate(order.createdAt, grain);
        const existing = buckets.get(key) ?? {
          orders: 0,
          revenue: 0,
          completed: 0,
          failed: 0,
        };
        existing.orders++;
        if (order.payment?.status === "COMPLETED") {
          existing.completed++;
          existing.revenue += order.totalInCents;
        }
        if (
          order.payment?.status === "FAILED" ||
          order.payment?.status === "CANCELLED"
        ) {
          existing.failed++;
        }
        buckets.set(key, existing);
      }

      const timeSeries = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));

      // ── Résoudre les noms des top tracks/albums ──────────────────────────
      const topTrackIds = topTracks
        .map((t) => t.trackId)
        .filter(Boolean) as string[];
      const topAlbumIds = topAlbums
        .map((a) => a.albumId)
        .filter(Boolean) as string[];

      const [trackDetails, albumDetails] = await Promise.all([
        prisma.track.findMany({
          where: { id: { in: topTrackIds } },
          select: { id: true, title: true, coverUrl: true },
        }),
        prisma.album.findMany({
          where: { id: { in: topAlbumIds } },
          select: { id: true, title: true, coverUrl: true },
        }),
      ]);

      const trackMap = new Map(trackDetails.map((t) => [t.id, formatTrack(t)]));
      const albumMap = new Map(albumDetails.map((a) => [a.id, formatAlbum(a)]));

      // ── Comptages globaux ────────────────────────────────────────────────
      const [totalOrders, totalCompletedOrders] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { payment: { status: "COMPLETED" } } }),
      ]);

      return {
        // Globaux
        totals: {
          users: totalUsersCount,
          customers: totalCustomersCount,
          orders: totalOrders,
          completedOrders: totalCompletedOrders,
          revenueInCents: allTimeRevenue,
          stripeRevenueInCents: stripeRevenue,
          pawapayRevenueInCents: pawapayRevenue,
        },
        // Plage sélectionnée
        period: {
          from: from.toISOString(),
          to: to.toISOString(),
          grain,
          orders: periodOrders.length,
          completedOrders: periodOrders.filter(
            (o) => o.payment?.status === "COMPLETED",
          ).length,
          revenueInCents: periodOrders
            .filter((o) => o.payment?.status === "COMPLETED")
            .reduce((sum, o) => sum + o.totalInCents, 0),
          timeSeries,
        },
        // Top ventes
        topTracks: topTracks.map((t) => ({
          ...trackMap.get(t.trackId!),
          soldCount: t._sum.quantity ?? 0,
        })),
        topAlbums: topAlbums.map((a) => ({
          ...albumMap.get(a.albumId!),
          soldCount: a._sum.quantity ?? 0,
        })),
        // Dernières commandes
        recentOrders: recentOrders.map((o) => ({
          orderId: o.id,
          createdAt: o.createdAt,
          totalInCents: o.totalInCents,
          currency: o.currency,
          paymentStatus: o.payment?.status ?? "PENDING",
          provider: o.payment?.provider ?? null,
          client: o.user ?? o.customer ?? null,
        })),
      };
    },
    {
      query: t.Optional(
        t.Object({
          from: t.Optional(t.String()),
          to: t.Optional(t.String()),
          grain: t.Optional(
            t.Union([t.Literal("day"), t.Literal("week"), t.Literal("month")]),
          ),
        }),
      ),
    },
  );
