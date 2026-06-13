export interface ClientRow {
  id: string;
  type: "user" | "customer" | "both";
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  role: string | null;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenueInCents: number;
  downloadCount: number;
  lastOrderAt: string | null;
}

export interface ClientDetail {
  user: any;
  customer: any;
  type: string;
  orders: any[];
}
