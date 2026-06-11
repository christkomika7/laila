import { Elysia } from "elysia";
import { env } from "./env";
import { authPlugin } from "./plugins/auth-plugin";
import { corsPlugin } from "./plugins/cors-plugin";
import { contactRoutes } from "./module/admin/contact";
import { galleryRoutes } from "./module/admin/gallery";
import staticPlugin from "@elysia/static";
import { musicRoutes } from "./module/admin/music";
import { storeRoutes } from "./module/admin/product";
import { checkoutRoutes } from "./module/payment/checkout";
import { pawapayWebhookRoutes } from "./module/webhook/pawapay";
import { stripeWebhookRoutes } from "./module/webhook/stripe";
import { paymentStatusRoutes } from "./module/payment/payment";
import { donationRoutes } from "./module/payment/donation";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(
    staticPlugin({
      assets: "./uploads",
      prefix: "/uploads",
    }),
  )
  .use(corsPlugin)
  .use(authPlugin)
  .use(contactRoutes)
  .use(galleryRoutes)
  .use(musicRoutes)
  .use(storeRoutes)
  .use(checkoutRoutes)
  .use(paymentStatusRoutes)
  .use(pawapayWebhookRoutes)
  .use(stripeWebhookRoutes)
  .use(donationRoutes)
  .listen(env.PORT);

console.log(
  `Laila music server is running at ${app.server?.hostname}:${app.server?.port}`,
);
