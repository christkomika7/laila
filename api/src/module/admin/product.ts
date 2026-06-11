import Elysia, { t } from "elysia";
import { requireAdmin } from "../../middleware/secure";
import { prisma } from "../../lib/prisma";
import { Storage } from "../../lib/storage";
import { formatProduct, uploadErrorMessage } from "../../lib/helpers";
import { $Enums } from "../../../generated/prisma/browser";

const variantSchema = t.Object({
  id: t.Optional(t.String()),
  title: t.String({ minLength: 1 }),
  priceInCents: t.Number(),
  salePriceInCents: t.Optional(t.Nullable(t.Number())),
  currency: t.String({ minLength: 1 }),
  inventoryQuantity: t.Number(),
  manageInventory: t.Boolean(),
  sku: t.Optional(t.Nullable(t.String())),
});

const additionalInfoSchema = t.Object({
  id: t.Optional(t.String()),
  title: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  order: t.Optional(t.Number()),
});

export const storeRoutes = new Elysia({ prefix: "/store" })

  // ── GET /store/products ──────────────────────────────────────────────────
  .get("/products", async () => {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        additionalInfo: { orderBy: { order: "asc" } },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return products.map(formatProduct);
  })

  // ── GET /store/products/:id ──────────────────────────────────────────────
  .get(
    "/products/:id",
    async ({ params, set }) => {
      const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
          images: { orderBy: { position: "asc" } },
          variants: true,
          additionalInfo: { orderBy: { order: "asc" } },
          tags: true,
        },
      });
      if (!product) {
        set.status = 404;
        return { error: "Not found" };
      }
      return formatProduct(product);
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── POST /store/products ─────────────────────────────────────────────────
  // multipart/form-data — variants/additionalInfo/tags arrive as JSON strings
  .post(
    "/products",
    async ({ body, set }) => {
      const {
        title,
        subtitle,
        description,
        ribbonText,
        artist,
        onlineStoreId,
        purchasable,
        status,
        coverImage,
        variants,
        additionalInfo,
        tags,
      } = body;

      let coverUrl = "";
      if (coverImage && (coverImage as File).size > 0) {
        const uploaded = await Storage.upload(
          coverImage as File,
          "store/covers",
        ).catch((err) => {
          set.status = 422;
          throw new Error(uploadErrorMessage(err));
        });
        coverUrl = uploaded.filename;
      }

      type VariantInput = {
        title: string;
        priceInCents: number;
        salePriceInCents?: number | null;
        currency?: string;
        inventoryQuantity?: number;
        manageInventory?: boolean;
        sku?: string | null;
      };
      type InfoInput = {
        title: string;
        description: string;
        order?: number;
      };

      const parsedVariants: VariantInput[] = variants ?? [];
      const parsedInfo: InfoInput[] = additionalInfo ?? [];
      const parsedTags: string[] = tags ?? [];

      const product = await prisma.product.create({
        data: {
          title,
          subtitle: subtitle ?? null,
          description,
          ribbonText: ribbonText ?? null,
          artist: artist ?? null,
          onlineStoreId: onlineStoreId ?? null,
          purchasable: purchasable === "true",
          status: (status as $Enums.ProductStatus) ?? "DRAFT",
          coverImage: coverUrl,
          variants: {
            create: parsedVariants.map((v) => ({
              title: v.title,
              priceInCents: Number(v.priceInCents),
              salePriceInCents: v.salePriceInCents
                ? Number(v.salePriceInCents)
                : null,
              currency: v.currency ?? "XAF",
              inventoryQuantity: Number(v.inventoryQuantity ?? 0),
              manageInventory: Boolean(v.manageInventory ?? true),
              sku: v.sku ?? null,
            })),
          },
          additionalInfo: {
            create: parsedInfo.map((info, i) => ({
              title: info.title,
              description: info.description,
              order: info.order ?? i,
            })),
          },
          tags: {
            create: parsedTags.map((value) => ({ value })),
          },
        },
        include: {
          images: { orderBy: { position: "asc" } },
          variants: true,
          additionalInfo: { orderBy: { order: "asc" } },
          tags: true,
        },
      });

      set.status = 201;
      return formatProduct(product);
    },
    {
      beforeHandle: [requireAdmin],
      body: t.Object({
        title: t.String({ minLength: 1 }),
        description: t.String({ minLength: 1 }),
        subtitle: t.Optional(t.String()),
        ribbonText: t.Optional(t.String()),
        artist: t.Optional(t.String()),
        onlineStoreId: t.Optional(t.String()),
        purchasable: t.String(),
        status: t.Optional(t.String()),
        coverImage: t.Optional(t.File()),
        variants: t.Optional(t.Array(variantSchema)),
        additionalInfo: t.Optional(t.Array(additionalInfoSchema)),
        tags: t.Optional(t.Array(t.String())),
      }),
      type: "formdata",
    },
  )

  // ── PUT /store/products/:id ──────────────────────────────────────────────
  // ── PUT /store/products/:id ──────────────────────────────────────────────
  .put(
    "/products/:id",
    async ({ params, body, set }) => {
      const existing = await prisma.product.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }

      let coverUrl: string | undefined;
      if (body.coverImage && (body.coverImage as File).size > 0) {
        const uploaded = await Storage.upload(
          body.coverImage as File,
          "store/covers",
        ).catch((err) => {
          set.status = 422;
          throw new Error(uploadErrorMessage(err));
        });
        if (existing.coverImage)
          await Storage.delete(existing.coverImage).catch(() => {});
        coverUrl = uploaded.filename;
      }

      type VariantInput = {
        id?: string;
        title: string;
        priceInCents: number;
        salePriceInCents?: number | null;
        currency?: string;
        inventoryQuantity?: number;
        manageInventory?: boolean;
        sku?: string | null;
        imageUrl?: string | null;
      };
      type InfoInput = {
        title: string;
        description: string;
        order?: number;
      };

      const parsedVariants: VariantInput[] | undefined = body.variants
        ? body.variants
        : undefined;
      const parsedInfo: InfoInput[] | undefined = body.additionalInfo
        ? body.additionalInfo
        : undefined;
      const parsedTags: string[] | undefined = body.tags
        ? body.tags
        : undefined;

      await prisma.product.update({
        where: { id: params.id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
          ...(body.description !== undefined && {
            description: body.description,
          }),
          ...(body.ribbonText !== undefined && { ribbonText: body.ribbonText }),
          ...(body.artist !== undefined && { artist: body.artist }),
          ...(body.onlineStoreId !== undefined && {
            onlineStoreId: body.onlineStoreId,
          }),
          ...(body.purchasable !== undefined && {
            purchasable: body.purchasable === "true",
          }),
          ...(body.status !== undefined && {
            status: body.status as $Enums.ProductStatus,
          }),
          ...(coverUrl !== undefined && { coverImage: coverUrl }),
        },
      });

      if (parsedVariants) {
        const existingVariants = await prisma.productVariant.findMany({
          where: { productId: params.id },
        });

        const incomingIds = parsedVariants
          .filter((v) => v.id)
          .map((v) => v.id!);

        // Supprimer seulement les variants qui ne sont plus dans la liste
        const toDelete = existingVariants
          .filter((v) => !incomingIds.includes(v.id))
          .map((v) => v.id);

        if (toDelete.length > 0) {
          // Nettoyer les images des variants supprimés
          const variantsToDelete = existingVariants.filter((v) =>
            toDelete.includes(v.id),
          );
          await Promise.all(
            variantsToDelete
              .filter((v) => v.imageUrl)
              .map((v) => Storage.delete(v.imageUrl!).catch(() => {})),
          );
          await prisma.productVariant.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        for (const v of parsedVariants) {
          if (v.id) {
            // Variant existant — préserver imageUrl si le client ne la fournit pas
            const existingVariant = existingVariants.find((e) => e.id === v.id);
            await prisma.productVariant.update({
              where: { id: v.id },
              data: {
                title: v.title,
                priceInCents: Number(v.priceInCents),
                salePriceInCents: v.salePriceInCents
                  ? Number(v.salePriceInCents)
                  : null,
                currency: v.currency ?? "XAF",
                inventoryQuantity: Number(v.inventoryQuantity ?? 0),
                manageInventory: Boolean(v.manageInventory ?? true),
                sku: v.sku ?? null,
                // On garde l'imageUrl existante si le client n'en envoie pas
                imageUrl:
                  v.imageUrl !== undefined
                    ? v.imageUrl
                    : (existingVariant?.imageUrl ?? null),
              },
            });
          } else {
            // Nouveau variant
            await prisma.productVariant.create({
              data: {
                productId: params.id,
                title: v.title,
                priceInCents: Number(v.priceInCents),
                salePriceInCents: v.salePriceInCents
                  ? Number(v.salePriceInCents)
                  : null,
                currency: v.currency ?? "XAF",
                inventoryQuantity: Number(v.inventoryQuantity ?? 0),
                manageInventory: Boolean(v.manageInventory ?? true),
                sku: v.sku ?? null,
                imageUrl: null,
              },
            });
          }
        }
      }

      if (parsedInfo) {
        await prisma.productInfo.deleteMany({
          where: { productId: params.id },
        });
        await prisma.productInfo.createMany({
          data: parsedInfo.map((info, i) => ({
            productId: params.id,
            title: info.title,
            description: info.description,
            order: info.order ?? i,
          })),
        });
      }

      if (parsedTags) {
        await prisma.productTag.deleteMany({ where: { productId: params.id } });
        await prisma.productTag.createMany({
          data: parsedTags.map((value) => ({ productId: params.id, value })),
        });
      }

      const refreshed = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
          images: { orderBy: { position: "asc" } },
          variants: true,
          additionalInfo: { orderBy: { order: "asc" } },
          tags: true,
        },
      });

      return formatProduct(refreshed!);
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.String({ minLength: 1 }),
        description: t.String({ minLength: 1 }),
        subtitle: t.Optional(t.String()),
        ribbonText: t.Optional(t.String()),
        artist: t.Optional(t.String()),
        onlineStoreId: t.Optional(t.String()),
        purchasable: t.String(),
        status: t.Optional(t.String()),
        coverImage: t.Optional(t.File()),
        variants: t.Optional(t.Array(variantSchema)),
        additionalInfo: t.Optional(t.Array(additionalInfoSchema)),
        tags: t.Optional(t.Array(t.String())),
      }),
      type: "formdata",
    },
  )

  // ── POST /store/products/:id/images ─────────────────────────────────────
  // Ajouter des images supplémentaires au produit (galerie)
  .post(
    "/products/:id/images",
    async ({ params, body, set }) => {
      const existing = await prisma.product.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }

      const files: File[] = Array.isArray(body.images)
        ? body.images
        : [body.images];
      const currentCount = await prisma.productImage.count({
        where: { productId: params.id },
      });

      const created = await Promise.all(
        files.map(async (file, i) => {
          const uploaded = await Storage.upload(file, "store/images").catch(
            (err) => {
              set.status = 422;
              throw new Error(uploadErrorMessage(err));
            },
          );
          return prisma.productImage.create({
            data: {
              productId: params.id,
              url: uploaded.filename,
              position: currentCount + i,
            },
          });
        }),
      );

      set.status = 201;
      return created.map((img) => ({ ...img, url: Storage.url(img.url) }));
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
      body: t.Object({ images: t.Union([t.File(), t.Array(t.File())]) }),
      type: "formdata",
    },
  )

  // ── DELETE /store/products/:id/images/:imageId ───────────────────────────
  .delete(
    "/products/:id/images/:imageId",
    async ({ params, set }) => {
      const image = await prisma.productImage.findUnique({
        where: { id: params.imageId },
      });
      if (!image || image.productId !== params.id) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.productImage.delete({ where: { id: params.imageId } });
      await Storage.delete(image.url).catch(() => {});
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String(), imageId: t.String() }),
    },
  )

  // ── POST /store/products/:id/variants/:variantId/image ───────────────────
  // Upload d'une image pour un variant spécifique (imageUrl)
  .post(
    "/products/:id/variants/:variantId/image",
    async ({ params, body, set }) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: params.variantId },
      });
      if (!variant || variant.productId !== params.id) {
        set.status = 404;
        return { error: "Not found" };
      }

      const file = body.image as File;
      if (!file || file.size === 0) {
        set.status = 400;
        return { error: "No image provided" };
      }

      const uploaded = await Storage.upload(file, "store/variants").catch(
        (err) => {
          set.status = 422;
          throw new Error(uploadErrorMessage(err));
        },
      );

      if (variant.imageUrl)
        await Storage.delete(variant.imageUrl).catch(() => {});

      const updated = await prisma.productVariant.update({
        where: { id: params.variantId },
        data: { imageUrl: uploaded.filename },
      });

      return {
        ...updated,
        imageUrl: Storage.url(updated.imageUrl!),
      };
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String(), variantId: t.String() }),
      body: t.Object({ image: t.File() }),
      type: "formdata",
    },
  )

  // ── DELETE /store/products/:id/variants/:variantId/image ─────────────────
  .delete(
    "/products/:id/variants/:variantId/image",
    async ({ params, set }) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: params.variantId },
      });
      if (!variant || variant.productId !== params.id) {
        set.status = 404;
        return { error: "Not found" };
      }
      if (variant.imageUrl)
        await Storage.delete(variant.imageUrl).catch(() => {});
      await prisma.productVariant.update({
        where: { id: params.variantId },
        data: { imageUrl: null },
      });
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String(), variantId: t.String() }),
    },
  )

  // ── DELETE /store/products/:id ───────────────────────────────────────────
  .delete(
    "/products/:id",
    async ({ params, set }) => {
      const existing = await prisma.product.findUnique({
        where: { id: params.id },
        include: { images: true, variants: true },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }

      if (existing.coverImage)
        await Storage.delete(existing.coverImage).catch(() => {});
      await Promise.all(
        existing.images.map((img) => Storage.delete(img.url).catch(() => {})),
      );
      await Promise.all(
        existing.variants
          .filter((v) => v.imageUrl)
          .map((v) => Storage.delete(v.imageUrl!).catch(() => {})),
      );

      await prisma.product.delete({ where: { id: params.id } });
      set.status = 204;
    },
    {
      beforeHandle: [requireAdmin],
      params: t.Object({ id: t.String() }),
    },
  );
