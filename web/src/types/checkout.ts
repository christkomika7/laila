export interface CheckoutPayload {
  email: string;
  name?: string;
  items: {
    variantId?: string;
    title: string;
    variantTitle?: string;
    priceInCents: number;
    quantity: number;
    currency: string;
    coverUrl: string | null;
  }[];
  paymentMethod: "card" | "mobile_money";
  msisdn?: string;
  correspondent?: string;
  country?: string;
  billingCountry?: string;
}

export interface CheckoutResponsePawapay {
  provider: "pawapay";
  orderId: string;
  paymentId: string;
  depositId: string;
  status: "ACCEPTED";
}

export interface CheckoutResponseStripe {
  provider: "stripe";
  orderId: string;
  paymentId: string;
  clientSecret: string;
}

export type CheckoutResponse = CheckoutResponsePawapay | CheckoutResponseStripe;

export type PaymentMethod = "mobile_money" | "card";
export type Status = "idle" | "processing" | "polling" | "completed" | "failed";
