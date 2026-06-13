import Elysia, { t } from "elysia";
import { requireAdmin } from "../../middleware/secure";
import { prisma } from "../../lib/prisma";
import { Storage } from "../../lib/storage";
import {
  formatAlbum,
  formatTrack,
  uploadAudio,
  uploadCover,
} from "../../lib/helpers";

export const musicRoutes = new Elysia({ prefix: "/music" })

  // ══════════════════════════════════════════════════════════════════
  // ALBUMS
  // ══════════════════════════════════════════════════════════════════

  // GET /music/albums — public (publiés seulement)
  .get("/albums", async () => {
    const albums = await prisma.album.findMany({
      where: { published: true },
      orderBy: { releaseDate: "desc" },
      include: {
        tracks: { where: { published: true }, orderBy: { createdAt: "asc" } },
      },
    });

    return albums.map(formatAlbum);
  })

  // GET /music/albums/all — admin (tous)
  .get(
    "/albums/all",
    async () => {
      const albums = await prisma.album.findMany({
        orderBy: { createdAt: "desc" },
        include: { tracks: { orderBy: { createdAt: "asc" } } },
      });
      return albums.map(formatAlbum);
    },
    { beforeHandle: [requireAdmin] },
  )

  // GET /music/albums/:id — public
  .get(
    "/albums/:id",
    async ({ params, set }) => {
      const album = await prisma.album.findUnique({
        where: { id: params.id },
        include: {
          tracks: { where: { published: true }, orderBy: { createdAt: "asc" } },
        },
      });
      if (!album || !album.published) {
        set.status = 404;
        return { error: "Not found" };
      }
      return formatAlbum(album);
    },
    { params: t.Object({ id: t.String() }) },
  )

  // GET /music/singles — public (tracks sans album)
  .get("/singles", async () => {
    const tracks = await prisma.track.findMany({
      where: { published: true, albumId: null },
      orderBy: { createdAt: "desc" },
      include: { album: true },
    });
    return tracks.map(formatTrack);
  })

  // GET /music/singles/all — admin
  .get(
    "/singles/all",
    async () => {
      const tracks = await prisma.track.findMany({
        where: { albumId: null },
        orderBy: { createdAt: "desc" },
        include: { album: true },
      });
      return tracks.map(formatTrack);
    },
    { beforeHandle: [requireAdmin] },
  )

  // POST /music/albums — admin
  .post(
    "/albums",
    async ({ body, set }) => {
      let coverUrl: string | undefined;
      if (body.cover && (body.cover as File).size > 0) {
        coverUrl = await uploadCover(body.cover as File, set);
      }

      const album = await prisma.album.create({
        data: {
          title: body.title,
          releaseDate: new Date(body.releaseDate),
          description: body.description ?? null,
          coverUrl: coverUrl ?? null,
          published: body.published === "true",
        },
        include: { tracks: true },
      });

      set.status = 201;
      return formatAlbum(album);
    },
    {
      beforeHandle: [requireAdmin],
      body: t.Object({
        title: t.String({ minLength: 1 }),
        releaseDate: t.String(),
        description: t.Optional(t.String()),
        cover: t.Optional(t.File()),
        published: t.Optional(t.String()),
      }),
      type: "formdata",
    },
  )

  // PUT /music/albums/:id — admin
  .put(
    "/albums/:id",
    async ({ params, body, set }) => {
      const existing = await prisma.album.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Album not found" };
      }

      let newCoverUrl: string | undefined;
      if (body.cover && (body.cover as File).size > 0) {
        newCoverUrl = await uploadCover(body.cover as File, set);
        if (existing.coverUrl)
          await Storage.delete(existing.coverUrl).catch(() => {});
      }

      const album = await prisma.album.update({
        where: { id: params.id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.releaseDate !== undefined && {
            releaseDate: new Date(body.releaseDate),
          }),
          ...(body.description !== undefined && {
            description: body.description,
          }),
          ...(body.published !== undefined && {
            published: body.published === "true",
          }),
          ...(newCoverUrl !== undefined && { coverUrl: newCoverUrl }),
        },
        include: { tracks: true },
      });

      return formatAlbum(album);
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        releaseDate: t.Optional(t.String()),
        description: t.Optional(t.String()),
        cover: t.Optional(t.File()),
        published: t.Optional(t.String()),
      }),
      type: "formdata",
    },
  )

  // PUT /music/albums/:id/publish — admin (toggle)
  .put(
    "/albums/:id/publish",
    async ({ params, set }) => {
      const existing = await prisma.album.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Album not found" };
      }

      const updated = await prisma.album.update({
        where: { id: params.id },
        data: { published: !existing.published },
      });
      return { id: updated.id, published: updated.published };
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  )

  // DELETE /music/albums/:id — admin
  .delete(
    "/albums/:id",
    async ({ params, set }) => {
      const existing = await prisma.album.findUnique({
        where: { id: params.id },
        include: { tracks: true },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Album not found" };
      }

      for (const track of existing.tracks) {
        if (track.fullAudioUrl)
          await Storage.delete(track.fullAudioUrl).catch(() => {});
        if (track.previewUrl)
          await Storage.delete(track.previewUrl).catch(() => {});
        if (track.coverUrl)
          await Storage.delete(track.coverUrl).catch(() => {});
      }
      if (existing.coverUrl)
        await Storage.delete(existing.coverUrl).catch(() => {});

      await prisma.album.delete({ where: { id: params.id } });
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  )

  // ══════════════════════════════════════════════════════════════════
  // TRACKS
  // ══════════════════════════════════════════════════════════════════

  // GET /music/tracks — public (?albumId=xxx optionnel)
  .get(
    "/tracks",
    async ({ query }) => {
      const tracks = await prisma.track.findMany({
        where: {
          published: true,
          ...(query.albumId ? { albumId: query.albumId } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: { album: true },
      });
      return tracks.map(formatTrack);
    },
    { query: t.Object({ albumId: t.Optional(t.String()) }) },
  )

  // GET /music/tracks/all — admin
  .get(
    "/tracks/all",
    async ({ query }) => {
      const tracks = await prisma.track.findMany({
        where: query.albumId ? { albumId: query.albumId } : {},
        orderBy: { createdAt: "desc" },
        include: { album: true },
      });
      return tracks.map(formatTrack);
    },
    {
      beforeHandle: [requireAdmin],
      query: t.Object({ albumId: t.Optional(t.String()) }),
    },
  )

  // GET /music/tracks/:id — public
  .get(
    "/tracks/:id",
    async ({ params, set }) => {
      const track = await prisma.track.findUnique({
        where: { id: params.id },
        include: { album: true },
      });
      if (!track || !track.published) {
        set.status = 404;
        return { error: "Not found" };
      }
      return formatTrack(track);
    },
    { params: t.Object({ id: t.String() }) },
  )

  // POST /music/tracks — admin
  .post(
    "/tracks",
    async ({ body, set }) => {
      if (!body.fullAudio || (body.fullAudio as File).size === 0) {
        set.status = 422;
        return { error: "Le fichier audio complet est requis." };
      }

      const [fullAudioUrl, previewUrl, coverUrl] = await Promise.all([
        uploadAudio(body.fullAudio as File, set),
        body.preview && (body.preview as File).size > 0
          ? uploadAudio(body.preview as File, set)
          : Promise.resolve(undefined),
        body.cover && (body.cover as File).size > 0
          ? uploadCover(body.cover as File, set)
          : Promise.resolve(undefined),
      ]);

      const featuring = body.featuringArtists
        ? JSON.stringify(
            body.featuringArtists
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
          )
        : null;

      const track = await prisma.track.create({
        data: {
          title: body.title,
          duration: parseFloat(body.duration),
          price: parseFloat(body.price),
          featuringArtists: featuring,
          fullAudioUrl,
          previewUrl: previewUrl ?? null,
          coverUrl: coverUrl ?? null,
          albumId:
            body.albumId && body.albumId !== "none" ? body.albumId : null,
          published: body.published === "true",
        },
        include: { album: true },
      });

      set.status = 201;
      return formatTrack(track);
    },
    {
      beforeHandle: [requireAdmin],
      body: t.Object({
        title: t.String({ minLength: 1 }),
        duration: t.String(),
        price: t.String(),
        featuringArtists: t.Optional(t.String()),
        albumId: t.Optional(t.String()),
        published: t.Optional(t.String()),
        fullAudio: t.File(),
        preview: t.Optional(t.File()),
        cover: t.Optional(t.File()),
      }),
      type: "formdata",
    },
  )

  // PUT /music/tracks/:id — admin
  .put(
    "/tracks/:id",
    async ({ params, body, set }) => {
      const existing = await prisma.track.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Track not found" };
      }

      let newFullAudioUrl: string | undefined;
      let newPreviewUrl: string | undefined;
      let newCoverUrl: string | undefined;

      if (body.fullAudio && (body.fullAudio as File).size > 0) {
        newFullAudioUrl = await uploadAudio(body.fullAudio as File, set);
        if (existing.fullAudioUrl)
          await Storage.delete(existing.fullAudioUrl).catch(() => {});
      }
      if (body.preview && (body.preview as File).size > 0) {
        newPreviewUrl = await uploadAudio(body.preview as File, set);
        if (existing.previewUrl)
          await Storage.delete(existing.previewUrl).catch(() => {});
      }
      if (body.cover && (body.cover as File).size > 0) {
        newCoverUrl = await uploadCover(body.cover as File, set);
        if (existing.coverUrl)
          await Storage.delete(existing.coverUrl).catch(() => {});
      }

      const featuring =
        body.featuringArtists !== undefined
          ? JSON.stringify(
              body.featuringArtists
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean),
            )
          : undefined;

      const track = await prisma.track.update({
        where: { id: params.id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.duration !== undefined && {
            duration: parseFloat(body.duration),
          }),
          ...(body.price !== undefined && { price: parseFloat(body.price) }),
          ...(body.published !== undefined && {
            published: body.published === "true",
          }),
          ...(body.albumId !== undefined && {
            albumId: body.albumId === "none" ? null : body.albumId,
          }),
          ...(featuring !== undefined && { featuringArtists: featuring }),
          ...(newFullAudioUrl !== undefined && {
            fullAudioUrl: newFullAudioUrl,
          }),
          ...(newPreviewUrl !== undefined && { previewUrl: newPreviewUrl }),
          ...(newCoverUrl !== undefined && { coverUrl: newCoverUrl }),
        },
        include: { album: true },
      });

      return formatTrack(track);
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        duration: t.Optional(t.String()),
        price: t.Optional(t.String()),
        featuringArtists: t.Optional(t.String()),
        albumId: t.Optional(t.String()),
        published: t.Optional(t.String()),
        fullAudio: t.Optional(t.File()),
        preview: t.Optional(t.File()),
        cover: t.Optional(t.File()),
      }),
      type: "formdata",
    },
  )

  // PUT /music/tracks/:id/publish — admin (toggle)
  .put(
    "/tracks/:id/publish",
    async ({ params, set }) => {
      const existing = await prisma.track.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Track not found" };
      }

      const updated = await prisma.track.update({
        where: { id: params.id },
        data: { published: !existing.published },
      });
      return { id: updated.id, published: updated.published };
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  )

  // DELETE /music/tracks/:id — admin
  .delete(
    "/tracks/:id",
    async ({ params, set }) => {
      const existing = await prisma.track.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Track not found" };
      }

      await Promise.allSettled([
        existing.fullAudioUrl ? Storage.delete(existing.fullAudioUrl) : null,
        existing.previewUrl ? Storage.delete(existing.previewUrl) : null,
        existing.coverUrl ? Storage.delete(existing.coverUrl) : null,
      ]);

      await prisma.track.delete({ where: { id: params.id } });
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  );
