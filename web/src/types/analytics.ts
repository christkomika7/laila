export interface Analytics {
  totals: {
    users: number;
    customers: number;
    orders: number;
    completedOrders: number;
    revenueInCents: number;
    stripeRevenueInCents: number;
    pawapayRevenueInCents: number;
  };
  period: {
    from: string;
    to: string;
    grain: string;
    orders: number;
    completedOrders: number;
    revenueInCents: number;
    timeSeries: {
      date: string;
      orders: number;
      revenue: number;
      completed: number;
      failed: number;
    }[];
  };
  topTracks: {
    id: string;
    title: string;
    coverUrl: string | null;
    soldCount: number;
  }[];
  topAlbums: {
    id: string;
    title: string;
    coverUrl: string | null;
    soldCount: number;
  }[];
  recentOrders: {
    orderId: string;
    createdAt: string;
    totalInCents: number;
    currency: string;
    paymentStatus: string;
    provider: string | null;
    client: { name: string | null; email: string } | null;
  }[];
}
