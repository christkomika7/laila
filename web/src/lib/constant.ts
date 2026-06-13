import type { ProductStatus } from "#/types/product";

export const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export const statusLabel: Record<ProductStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const statusVariant: Record<
  ProductStatus,
  "secondary" | "default" | "outline"
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  COMPLETED: { label: "Payé", className: "bg-emerald-500/10 text-emerald-400" },
  PENDING: { label: "En attente", className: "bg-amber-500/10 text-amber-400" },
  PROCESSING: { label: "En cours", className: "bg-blue-500/10 text-blue-400" },
  FAILED: { label: "Échoué", className: "bg-red-500/10 text-red-400" },
  CANCELLED: {
    label: "Annulé",
    className: "bg-neutral-500/10 text-neutral-400",
  },
  REFUNDED: {
    label: "Remboursé",
    className: "bg-purple-500/10 text-purple-400",
  },
};

export const GRAIN_OPTIONS = [
  { value: "day", label: "Par jour" },
  { value: "week", label: "Par semaine" },
  { value: "month", label: "Par mois" },
];

export const DATE_PRESETS = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "1 an", days: 365 },
];

export const TYPE_CONFIG = {
  both: {
    label: "User + Client",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  user: {
    label: "Utilisateur",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  customer: {
    label: "Client",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

export const SUBJECT_LABELS: Record<string, string> = {
  booking: "Booking",
  press: "Prise de contact",
  other: "Autres",
};

export const statusLabels: Record<string, string> = {
  COMPLETED: "Payée",
  PENDING: "En attente",
  FAILED: "Échouée",
  PROCESSING: "En cours",
  CANCELLED: "Annulée",
};

export const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export const typeLabels: Record<string, string> = {
  payment: "Paiement",
  donation: "Don",
};
