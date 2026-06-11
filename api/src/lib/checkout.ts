import { t } from "elysia";
import { CartItem } from "../types/payment";
import { prisma } from "./prisma";
import { extractVariantId, isPhysicalProduct } from "./helpers";

const XAF_TO_EUR_RATE = 655.957;
const XOF_TO_EUR_RATE = 655.957;

export const cartItemSchema = t.Object({
  variantId: t.String(),
  quantity: t.Number({ minimum: 1 }),
  title: t.String(),
  variantTitle: t.Optional(t.String()),
  priceInCents: t.Number({ minimum: 0 }),
  currency: t.String(),
  coverUrl: t.Optional(t.String()),
});

export const checkoutBodySchema = t.Object({
  email: t.String({ format: "email" }),
  name: t.String(),
  items: t.Array(cartItemSchema, { minItems: 1 }),
  paymentMethod: t.Union([t.Literal("mobile_money"), t.Literal("card")]),
  country: t.Optional(t.String()),
  correspondent: t.Optional(t.String()),
  msisdn: t.Optional(t.String()),
  billingCountry: t.Optional(t.String()),
});

export async function checkStock(items: CartItem[]) {
  const physicalItems = items.filter((i) => isPhysicalProduct(i.variantId));
  const physicalVariantIds = physicalItems.map((i) =>
    extractVariantId(i.variantId),
  );

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: physicalVariantIds } },
    select: {
      id: true,
      priceInCents: true,
      manageInventory: true,
      inventoryQuantity: true,
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  for (const item of physicalItems) {
    const cleanId = extractVariantId(item.variantId);
    const variant = variantMap.get(cleanId);
    if (!variant) throw new Error(`Variant introuvable : ${item.variantId}`);
    if (variant.manageInventory && variant.inventoryQuantity < item.quantity) {
      throw new Error(
        `Stock insuffisant pour la variante ${item.variantId} ` +
          `(disponible: ${variant.inventoryQuantity}, demandé: ${item.quantity})`,
      );
    }
  }

  return items.map((item) => {
    const raw = item.variantId;
    const cleanId = extractVariantId(raw);
    const variant = variantMap.get(cleanId);

    // Déterminer le bon champ FK selon le type
    const fkField = raw.startsWith("track:")
      ? { trackId: cleanId }
      : raw.startsWith("album:")
        ? { albumId: cleanId }
        : { variantId: cleanId };

    return {
      ...fkField,
      quantity: item.quantity,
      unitPriceInCents: variant?.priceInCents ?? item.priceInCents,
      title: item.title,
      coverUrl: item.coverUrl,
    };
  });
}

export function mapToStripeCurrency(currency: string): string {
  const map: Record<string, string> = { XAF: "eur", XOF: "eur", GNF: "eur" };
  return (map[currency] ?? currency).toLowerCase();
}

export function toStripeAmount(
  amountInCents: number,
  currency: string,
): number {
  const upper = currency.toUpperCase();

  if (upper === "XAF" || upper === "XOF") {
    const amountInEUR = amountInCents / XAF_TO_EUR_RATE;
    return Math.max(50, Math.round(amountInEUR * 100));
  }

  const zeroDecimal = [
    "BIF",
    "CLP",
    "GNF",
    "JPY",
    "KMF",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XPF",
  ];
  if (zeroDecimal.includes(upper)) {
    return Math.round(amountInCents / 100);
  }

  return amountInCents;
}

export function formatPawapayAmount(
  amountInCents: number,
  currency: string,
): string {
  const noDecimal = ["XAF", "XOF", "GNF", "RWF", "UGX", "CDF"];
  if (noDecimal.includes(currency.toUpperCase())) {
    return String(Math.round(amountInCents));
  }
  return (amountInCents / 100).toFixed(2);
}

export function dialCodeDigits(countryCode: string): string {
  const map: Record<string, string> = {
    COG: "242",
    CMR: "237",
    CIV: "225",
    SEN: "221",
    GHA: "233",
    NGA: "234",
    KEN: "254",
    TZA: "255",
    UGA: "256",
    ZMB: "260",
    ZWE: "263",
    MOZ: "258",
    GIN: "224",
    BFA: "226",
    MLI: "223",
    MDG: "261",
    RWA: "250",
    BEN: "229",
    TGO: "228",
    GAB: "241",
    SLE: "232",
    GNB: "245",
    COD: "243",
    ETH: "251",
  };
  return map[countryCode] ?? "";
}
