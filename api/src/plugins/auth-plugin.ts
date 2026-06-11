import { Elysia, Context } from "elysia";
import { auth } from "../lib/auth";

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.status(405);
  }
};

export const authPlugin = new Elysia().all("/api/auth/*", betterAuthView);
