import { cartItemSchema, checkoutBodySchema } from "../lib/checkout";

export type CheckoutBody = typeof checkoutBodySchema.static;
export type CartItem = typeof cartItemSchema.static;
