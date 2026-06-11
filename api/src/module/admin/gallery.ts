import Elysia, { t } from "elysia";
import { requireAdmin } from "../../middleware/secure";
import { prisma } from "../../lib/prisma";
import { Storage } from "../../lib/storage";
import { formatItem, uploadErrorMessage } from "../../lib/helpers";

export const galleryRoutes = new Elysia({ prefix: "/gallery" })

  .get("/", async () => {
    const items = await prisma.gallery.findMany({
      orderBy: [{ pageOrder: "asc" }, { createdAt: "asc" }],
    });
    return items.map(formatItem);
  })

  .get(
    "/:id",
    async ({ params, set }) => {
      const item = await prisma.gallery.findUnique({
        where: { id: params.id },
      });
      if (!item) {
        set.status = 404;
        return { error: "Not found" };
      }
      return formatItem(item);
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, set }) => {
      const { title, description, pageOrder, media, isExclusive } = body;

      const uploaded = await Storage.upload(media as File, "gallery").catch(
        (err) => {
          set.status = 422;
          throw new Error(uploadErrorMessage(err));
        },
      );

      const item = await prisma.gallery.create({
        data: {
          title,
          description: description ?? null,
          imageUrl: uploaded.filename,
          mediaType: uploaded.mediaType,
          isExclusive: isExclusive === "true",
          pageOrder: Number(pageOrder ?? 0),
        },
      });

      set.status = 201;
      return formatItem(item);
    },
    {
      beforeHandle: [requireAdmin],
      body: t.Object({
        title: t.String({ minLength: 1 }),
        isExclusive: t.String(),
        description: t.Optional(t.String()),
        pageOrder: t.Optional(t.String()),
        media: t.File(),
      }),
      type: "formdata",
    },
  )

  .put(
    "/:id",
    async ({ params, body, set }) => {
      const existing = await prisma.gallery.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }

      let newFilename: string | undefined;
      let newMediaType: "IMAGE" | "VIDEO" | "AUDIO" | undefined;

      if (body.media && (body.media as File).size > 0) {
        const uploaded = await Storage.upload(
          body.media as File,
          "gallery",
        ).catch((err) => {
          set.status = 422;
          throw new Error(uploadErrorMessage(err));
        });
        newFilename = uploaded.filename;
        newMediaType = uploaded.mediaType;
        await Storage.delete(existing.imageUrl).catch(() => {});
      }

      const updated = await prisma.gallery.update({
        where: { id: params.id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && {
            description: body.description,
          }),
          ...(body.pageOrder !== undefined && {
            pageOrder: Number(body.pageOrder),
          }),
          ...(newFilename && { imageUrl: newFilename }),
          ...(newMediaType && { mediaType: newMediaType }),
          ...(body.isExclusive && { isExclusive: body.isExclusive === "true" }),
        },
      });

      return formatItem(updated);
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        isExclusive: t.String(),
        description: t.Optional(t.String()),
        pageOrder: t.Optional(t.String()),
        media: t.Optional(t.File()),
      }),
      type: "formdata",
    },
  )

  .delete(
    "/:id",
    async ({ params, set }) => {
      const existing = await prisma.gallery.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.gallery.delete({ where: { id: params.id } });
      await Storage.delete(existing.imageUrl).catch(() => {});
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  );
