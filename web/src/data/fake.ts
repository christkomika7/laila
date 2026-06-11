import type { Product } from "#/types/product";

export const FAKE_PRODUCTS: Record<string, Product> = {
  "prod-1": {
    id: "prod-1",
    title: "T-Shirt RÉSILIENCE",
    subtitle: "Édition limitée — Mai 2026",
    artist: "Laila",
    description:
      "<p>T-shirt premium 100 % coton biologique, sérigraphie à la main. Coupe unisexe, lavage à 30°C.</p>",
    ribbon_text: "Nouveauté",
    purchasable: true,
    online_store_id: "osi_003",
    cover_image: "https://picsum.photos/seed/tshirt1/600/750",
    images: [
      { url: "https://picsum.photos/seed/tshirt1/600/750" },
      { url: "https://picsum.photos/seed/tshirt2/600/750" },
      { url: "https://picsum.photos/seed/tshirt3/600/750" },
    ],
    variants: [
      {
        id: "v-s",
        title: "S",
        price_in_cents: 1500000,
        currency: "XAF",
        inventory_quantity: 10,
        manage_inventory: true,
      },
      {
        id: "v-m",
        title: "M",
        price_in_cents: 1500000,
        currency: "XAF",
        inventory_quantity: 5,
        manage_inventory: true,
      },
      {
        id: "v-l",
        title: "L",
        price_in_cents: 1500000,
        currency: "XAF",
        inventory_quantity: 2,
        manage_inventory: true,
      },
      {
        id: "v-xl",
        title: "XL",
        price_in_cents: 1500000,
        currency: "XAF",
        inventory_quantity: 0,
        manage_inventory: true,
      },
    ],
    additional_info: [
      {
        id: "ai-1",
        order: 1,
        title: "Livraison",
        description:
          "<p>Expédition sous 3–5 jours ouvrés. Livraison offerte dès 25 000 XAF d'achat.</p>",
      },
      {
        id: "ai-2",
        order: 2,
        title: "Retours",
        description:
          "<p>Retours acceptés sous 14 jours, produit non porté avec étiquettes.</p>",
      },
    ],
  },

  "prod-2": {
    id: "prod-2",
    title: "Hoodie RÉSILIENCE",
    subtitle: "Collection capsule",
    artist: "Laila",
    description:
      "<p>Hoodie épais 320 g/m², broderie ton sur ton au dos. Coloris exclusif Brazzaville Night.</p>",
    purchasable: true,
    online_store_id: "osi_005",
    cover_image: "https://picsum.photos/seed/hoodie1/600/750",
    images: [
      { url: "https://picsum.photos/seed/hoodie1/600/750" },
      { url: "https://picsum.photos/seed/hoodie2/600/750" },
    ],
    variants: [
      {
        id: "h-s",
        title: "S",
        price_in_cents: 2500000,
        sale_price_in_cents: 2000000,
        currency: "XAF",
        inventory_quantity: 8,
        manage_inventory: true,
      },
      {
        id: "h-m",
        title: "M",
        price_in_cents: 2500000,
        sale_price_in_cents: 2000000,
        currency: "XAF",
        inventory_quantity: 4,
        manage_inventory: true,
      },
      {
        id: "h-l",
        title: "L",
        price_in_cents: 2500000,
        sale_price_in_cents: 2000000,
        currency: "XAF",
        inventory_quantity: 1,
        manage_inventory: true,
      },
    ],
  },

  "prod-3": {
    id: "prod-3",
    title: "Poster Pili Pili",
    subtitle: "Format A2 — papier mat 200 g",
    artist: "Laila",
    description:
      "<p>Poster officiel du clip <em>Pili Pili</em>, impression fine art limitée à 200 exemplaires numérotés et signés.</p>",
    ribbon_text: "Signé",
    purchasable: false,
    cover_image: "https://picsum.photos/seed/poster1/600/750",
    images: [{ url: "https://picsum.photos/seed/poster1/600/750" }],
    variants: [
      {
        id: "p-unique",
        title: "Unique",
        price_in_cents: 800000,
        currency: "XAF",
        inventory_quantity: 0,
        manage_inventory: false,
      },
    ],
  },

  "prod-4": {
    id: "prod-4",
    title: "RÉSILIENCE — Album",
    subtitle: "Album studio complet",
    artist: "Laila",
    description:
      "<p>Album studio complet de Laila — 6 titres entre afrobeats, soul et slam congolais. Téléchargement numérique HD inclus.</p>",
    ribbon_text: "Album",
    cover_image:
      "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/74400d7e7fd75f6d210b64225215beb6.png",
    purchasable: true,
    online_store_id: "osi_001",
    images: [
      {
        url: "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/74400d7e7fd75f6d210b64225215beb6.png",
      },
    ],
    variants: [
      {
        id: "alb-num",
        title: "Numérique",
        price_in_cents: 510000,
        currency: "XAF",
        inventory_quantity: 999,
        manage_inventory: false,
      },
      {
        id: "alb-cd",
        title: "CD physique",
        price_in_cents: 1200000,
        currency: "XAF",
        inventory_quantity: 30,
        manage_inventory: true,
      },
    ],
  },

  "prod-5": {
    id: "prod-5",
    title: "Vibe — Single",
    subtitle: "Téléchargement numérique",
    artist: "Laila",
    description:
      "<p>Single <em>Vibe</em> en téléchargement haute qualité (WAV + MP3).</p>",
    purchasable: true,
    cover_image: "https://picsum.photos/seed/vibe/600/600",
    images: [{ url: "https://picsum.photos/seed/vibe/600/600" }],
    variants: [
      {
        id: "vibe-dl",
        title: "Numérique",
        price_in_cents: 50000,
        currency: "XAF",
        inventory_quantity: 999,
        manage_inventory: false,
      },
    ],
  },

  "prod-6": {
    id: "prod-6",
    title: "MBM — Single",
    subtitle: "ft. Makhalba",
    artist: "Laila ft. Makhalba",
    description:
      "<p>Single <em>MBM</em> feat. Makhalba — téléchargement haute qualité.</p>",
    purchasable: true,
    cover_image: "https://picsum.photos/seed/mbm/600/600",
    images: [{ url: "https://picsum.photos/seed/mbm/600/600" }],
    variants: [
      {
        id: "mbm-dl",
        title: "Numérique",
        price_in_cents: 50000,
        currency: "XAF",
        inventory_quantity: 999,
        manage_inventory: false,
      },
    ],
  },

  "prod-7": {
    id: "prod-7",
    title: "La poupée de Mossaka",
    subtitle: "Single numérique",
    artist: "Laila",
    description:
      "<p>Single <em>La poupée de Mossaka</em> — téléchargement haute qualité.</p>",
    purchasable: true,
    cover_image: "https://picsum.photos/seed/mossaka/600/600",
    images: [{ url: "https://picsum.photos/seed/mossaka/600/600" }],
    variants: [
      {
        id: "mos-dl",
        title: "Numérique",
        price_in_cents: 50000,
        currency: "XAF",
        inventory_quantity: 999,
        manage_inventory: false,
      },
    ],
  },
};
