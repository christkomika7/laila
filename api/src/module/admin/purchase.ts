import Elysia, { t } from "elysia";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import JSZip from "jszip";
import {
  fetchBuffer,
  formatAlbum,
  formatTrack,
  inferExt,
  safe,
} from "../../lib/helpers";
import { readAudioBuffer } from "../../lib/storage";

async function requireUser(request: Request, set: any) {
  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);
  if (!session) {
    set.status = 401;
    return { error: "Authentification requise." };
  }
  return session;
}

export const purchasesRoutes = new Elysia({ prefix: "/purchases" })

  /**
   * GET /purchases
   * List all purchases (orders + their payment status) for the authenticated user.
   * Returns orders in reverse chronological order with a per-item breakdown.
   */
  .get("/", async ({ request, set }) => {
    const session = await requireUser(request, set);
    if (!session || "error" in session) return session;

    const userId = session.user.id;
    const userEmail = session.user.email;

    const customer = await prisma.customer.findUnique({
      where: { email: userEmail },
    });

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ userId }, ...(customer ? [{ customerId: customer.id }] : [])],
      },
      include: {
        payment: true,
        items: {
          include: {
            track: {
              select: {
                id: true,
                title: true,
                duration: true,
                coverUrl: true,
                albumId: true,
              },
            },
            album: { select: { id: true, title: true, coverUrl: true } },
            variant: {
              select: {
                id: true,
                title: true,
                product: {
                  select: { id: true, title: true, coverImage: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map((order) => ({
      orderId: order.id,
      createdAt: order.createdAt,
      totalInCents: order.totalInCents,
      currency: order.currency,
      orderStatus: order.status,
      payment: order.payment
        ? {
            id: order.payment.id,
            provider: order.payment.provider,
            status: order.payment.status,
            paidAt: order.payment.completedAt ?? null,
            failedAt: order.payment.failedAt ?? null,
            failureReason: order.payment.failureReason ?? null,
            method:
              order.payment.provider === "STRIPE"
                ? `Carte ${order.payment.cardBrand ?? ""} ****${order.payment.cardLast4 ?? ""}`.trim()
                : `Mobile Money — ${order.payment.correspondent ?? ""} (${order.payment.msisdn ?? ""})`.trim(),
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        totalPriceInCents: item.unitPriceInCents * item.quantity,
        type: item.trackId ? "track" : item.albumId ? "album" : "product",
        track: item.track ? formatTrack(item.track) : null,
        album: item.album ? formatAlbum(item.album) : null,
        product: item.variant
          ? { variantTitle: item.variant.title, ...item.variant.product }
          : null,
      })),
    }));

    return result;
  })

  /**
   * GET /purchases/library
   * Return all albums and tracks the user has successfully purchased,
   * ready to display in a music library view.
   */
  .get(
    "/library",
    async ({ request, set, query }) => {
      // Si orderId fourni → on retourne juste cette commande (guest ou user)
      if (query.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: query.orderId },
          include: {
            items: {
              include: {
                track: {
                  include: {
                    album: {
                      select: { id: true, title: true, coverUrl: true },
                    },
                  },
                },
                album: {
                  include: {
                    tracks: {
                      where: { published: true },
                      orderBy: { title: "asc" },
                      select: {
                        id: true,
                        title: true,
                        duration: true,
                        coverUrl: true,
                        fullAudioUrl: true,
                        featuringArtists: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!order) {
          set.status = 404;
          return { error: "Commande introuvable." };
        }

        const albumsMap = new Map<string, any>();
        const tracksMap = new Map<string, any>();

        for (const item of order.items) {
          if (item.album && !albumsMap.has(item.album.id)) {
            albumsMap.set(item.album.id, {
              id: item.album.id,
              title: item.album.title,
              coverUrl: item.album.coverUrl,
              tracks: item.album.tracks,
              purchasedAt: order.createdAt,
            });
          }
          if (item.track && !tracksMap.has(item.track.id)) {
            tracksMap.set(item.track.id, {
              id: item.track.id,
              title: item.track.title,
              duration: item.track.duration,
              coverUrl: item.track.coverUrl,
              fullAudioUrl: item.track.fullAudioUrl,
              featuringArtists: item.track.featuringArtists ?? null,
              album: item.track.album ?? null,
              purchasedAt: order.createdAt,
            });
          }
        }

        return {
          albums: Array.from(albumsMap.values()).map(formatAlbum),
          singles: Array.from(tracksMap.values()).map(formatTrack),
        };
      }

      // Sinon → user connecté obligatoire
      const session = await requireUser(request, set);
      if (!session || "error" in session) return session;

      const userId = session.user.id;
      const userEmail = session.user.email;

      const customer = await prisma.customer.findUnique({
        where: { email: userEmail },
      });

      const orders = await prisma.order.findMany({
        where: {
          OR: [{ userId }, ...(customer ? [{ customerId: customer.id }] : [])],
        },
        include: {
          items: {
            include: {
              track: {
                include: {
                  album: { select: { id: true, title: true, coverUrl: true } },
                },
              },
              album: {
                include: {
                  tracks: {
                    where: { published: true },
                    orderBy: { title: "asc" },
                    select: {
                      id: true,
                      title: true,
                      duration: true,
                      coverUrl: true,
                      fullAudioUrl: true,
                      featuringArtists: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const albumsMap = new Map<string, any>();
      const tracksMap = new Map<string, any>();

      for (const order of orders) {
        for (const item of order.items) {
          if (item.album && !albumsMap.has(item.album.id)) {
            albumsMap.set(item.album.id, {
              id: item.album.id,
              title: item.album.title,
              coverUrl: item.album.coverUrl,
              tracks: item.album.tracks,
              purchasedAt: order.createdAt,
            });
          }
          if (item.track && !tracksMap.has(item.track.id)) {
            tracksMap.set(item.track.id, {
              id: item.track.id,
              title: item.track.title,
              duration: item.track.duration,
              coverUrl: item.track.coverUrl,
              fullAudioUrl: item.track.fullAudioUrl,
              featuringArtists: item.track.featuringArtists ?? null,
              album: item.track.album ?? null,
              purchasedAt: order.createdAt,
            });
          }
        }
      }

      return {
        albums: Array.from(albumsMap.values())
          .sort(
            (a, b) =>
              new Date(b.purchasedAt).getTime() -
              new Date(a.purchasedAt).getTime(),
          )
          .map(formatAlbum),
        singles: Array.from(tracksMap.values())
          .sort(
            (a, b) =>
              new Date(b.purchasedAt).getTime() -
              new Date(a.purchasedAt).getTime(),
          )
          .map(formatTrack),
      };
    },
    {
      query: t.Optional(t.Object({ orderId: t.Optional(t.String()) })),
    },
  )

  /**
   * GET /purchases/download
   * Stream a ZIP of all purchased audio files.
   *
   * ZIP structure:
   *   Albums/
   *     <Album Title>/
   *       cover.jpg          (if coverUrl available)
   *       01 - Track Name.mp3
   *       02 - Track Name.mp3
   *       ...
   *   Singles/
   *     <Track Title>.mp3
   *
   * Only COMPLETED payments are included.
   * An optional ?orderId= query param restricts to a single order.
   */
  .get(
    "/download",
    async ({ request, set, query }) => {
      let orders: any[];

      if (query.orderId) {
        // Guest ou user — on récupère directement par orderId
        const order = await prisma.order.findUnique({
          where: { id: query.orderId },
          include: {
            items: {
              include: {
                track: {
                  select: {
                    id: true,
                    title: true,
                    fullAudioUrl: true,
                    coverUrl: true,
                    albumId: true,
                    album: {
                      select: { id: true, title: true, coverUrl: true },
                    },
                  },
                },
                album: {
                  include: {
                    tracks: {
                      where: { published: true },
                      orderBy: { title: "asc" },
                      select: {
                        id: true,
                        title: true,
                        fullAudioUrl: true,
                        coverUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!order) {
          set.status = 404;
          return { error: "Commande introuvable." };
        }

        orders = [order];
      } else {
        // Pas d'orderId → session obligatoire
        const session = await requireUser(request, set);
        if (!session || "error" in session) return session;

        const userId = session.user.id;
        const userEmail = session.user.email;

        const customer = await prisma.customer.findUnique({
          where: { email: userEmail },
        });

        orders = await prisma.order.findMany({
          where: {
            OR: [
              { userId },
              ...(customer ? [{ customerId: customer.id }] : []),
            ],
          },
          include: {
            items: {
              include: {
                track: {
                  select: {
                    id: true,
                    title: true,
                    fullAudioUrl: true,
                    coverUrl: true,
                    albumId: true,
                    album: {
                      select: { id: true, title: true, coverUrl: true },
                    },
                  },
                },
                album: {
                  include: {
                    tracks: {
                      where: { published: true },
                      orderBy: { title: "asc" },
                      select: {
                        id: true,
                        title: true,
                        fullAudioUrl: true,
                        coverUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      if (orders.length === 0) {
        set.status = 404;
        return { error: "Aucun achat confirmé trouvé." };
      }

      const albumsMap = new Map<
        string,
        {
          title: string;
          coverUrl: string | null;
          tracks: {
            id: string;
            title: string;
            fullAudioUrl: string;
            coverUrl: string | null;
          }[];
        }
      >();

      const singlesMap = new Map<
        string,
        {
          title: string;
          fullAudioUrl: string;
          albumTitle: string | null;
        }
      >();

      for (const order of orders) {
        for (const item of order.items) {
          if (item.album) {
            if (!albumsMap.has(item.album.id)) {
              albumsMap.set(item.album.id, {
                title: item.album.title,
                coverUrl: item.album.coverUrl,
                tracks: item.album.tracks,
              });
            }
          }

          if (item.track && !item.albumId) {
            if (!singlesMap.has(item.track.id)) {
              singlesMap.set(item.track.id, {
                title: item.track.title,
                fullAudioUrl: item.track.fullAudioUrl,
                albumTitle: item.track.album?.title ?? null,
              });
            }
          }
        }
      }

      const zip = new JSZip();

      if (albumsMap.size > 0) {
        const albumsFolder = zip.folder("Albums")!;

        for (const [, a] of albumsMap) {
          const album = formatAlbum(a);
          const albumFolder = albumsFolder.folder(safe(album.title))!;

          if (album.coverUrl) {
            try {
              const coverBuf = await fetchBuffer(album.coverUrl);
              const coverExt =
                album.coverUrl
                  .split("?")[0]
                  .match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg";
              albumFolder.file(`cover.${coverExt}`, coverBuf);
            } catch {}
          }

          const pad = album.tracks.length >= 10 ? 2 : 1;
          for (let i = 0; i < album.tracks.length; i++) {
            const track = album.tracks[i];
            try {
              const audioBuf = await fetchBuffer(track.fullAudioUrl);
              const ext = inferExt(track.fullAudioUrl);
              const num = String(i + 1).padStart(pad, "0");
              albumFolder.file(
                `${num} - ${safe(track.title)}.${ext}`,
                audioBuf,
              );
            } catch {}
          }
        }
      }

      if (singlesMap.size > 0) {
        const singlesFolder = zip.folder("Singles")!;

        for (const [, t] of singlesMap) {
          const track = formatTrack(t);
          try {
            const audioBuf = await fetchBuffer(track.fullAudioUrl);
            const ext = inferExt(track.fullAudioUrl);
            singlesFolder.file(`${safe(track.title)}.${ext}`, audioBuf);
          } catch {}
        }
      }

      const zipBuffer = await zip.generateAsync({
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const filename = query.orderId
        ? `commande-${query.orderId.slice(0, 8)}.zip`
        : `ma-musique.zip`;

      return new Response(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(zipBuffer.byteLength),
        },
      });
    },
    {
      query: t.Optional(t.Object({ orderId: t.Optional(t.String()) })),
    },
  )
  .get(
    "/download/item",
    async ({ request, set, query }) => {
      const session = await requireUser(request, set);
      if (!session || "error" in session) return session;

      const { type, id } = query;

      const zip = new JSZip();

      if (type === "album") {
        const current = await prisma.album.findUnique({
          where: { id },
          include: {
            tracks: {
              where: { published: true },
              orderBy: { title: "asc" },
              select: {
                id: true,
                title: true,
                fullAudioUrl: true,
                coverUrl: true,
              },
            },
          },
        });

        const album = formatAlbum(current);

        if (!album) {
          set.status = 404;
          return { error: "Album introuvable." };
        }

        const albumFolder = zip.folder(safe(album.title))!;
        if (album.coverUrl) {
          try {
            const buf = await readAudioBuffer(album.coverUrl);
            const ext =
              album.coverUrl.split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] ??
              "jpg";
            albumFolder.file(`cover.${ext}`, buf);
          } catch {}
        }
        const pad = album.tracks.length >= 10 ? 2 : 1;
        for (let i = 0; i < album.tracks.length; i++) {
          try {
            const buf = await readAudioBuffer(album.tracks[i].fullAudioUrl);
            const ext = inferExt(album.tracks[i].fullAudioUrl);
            albumFolder.file(
              `${String(i + 1).padStart(pad, "0")} - ${safe(album.tracks[i].title)}.${ext}`,
              buf,
            );
          } catch {}
        }

        const zipBuffer = await zip.generateAsync({
          type: "arraybuffer",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        return new Response(zipBuffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${safe(album.title)}.zip"`,
            "Content-Length": String(zipBuffer.byteLength),
          },
        });
      } else {
        const current = await prisma.track.findUnique({ where: { id } });
        const track = formatTrack(current);
        if (!track) {
          set.status = 404;
          return { error: "Track introuvable." };
        }

        const singlesFolder = zip.folder("Singles")!;
        try {
          const audioBuf = await readAudioBuffer(track.fullAudioUrl);
          const ext = inferExt(track.fullAudioUrl);
          singlesFolder.file(`${safe(track.title)}.${ext}`, audioBuf);
        } catch {}

        const zipBuffer = await zip.generateAsync({
          type: "arraybuffer",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        return new Response(zipBuffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${safe(track.title)}.zip"`,
            "Content-Length": String(zipBuffer.byteLength),
          },
        });
      }
    },
    {
      query: t.Object({
        type: t.Union([t.Literal("album"), t.Literal("track")]),
        id: t.String(),
      }),
    },
  );
