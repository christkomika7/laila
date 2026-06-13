export type InvoiceItem = {
  title: string;
  quantity: number;
  unitPriceInCents: number;
  coverUrl?: string;
};

export type Invoice = {
  id: string;
  type: "payment" | "donation";
  status: string;
  provider: string;
  totalInCents: number;
  currency: string;
  createdAt: string;
  completedAt: string | null;
  items?: InvoiceItem[];
  customer?: {
    name: string | null;
    email: string | null;
    country?: string;
  } | null;
  user?: { name: string | null; email: string | null } | null;
  hide?: boolean;
};
