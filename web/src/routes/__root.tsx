import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "@/components/ui/sonner";

import "../styles.css";
import { authClient } from "#/lib/auth-client";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Bienvenu chez Laila Music" },
      {
        name: "description",
        content:
          "Découvrez et téléchargez de la musique de Laïla Music - Albums, singles et titres exclusifs",
      },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Bienvenu chez Laila Music" },
      {
        property: "og:description",
        content:
          "Découvrez et téléchargez de la musique de Laïla Music - Albums, singles et titres exclusifs",
      },
      {
        property: "og:image",
        content:
          "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/01e5922106e8cf5d12a63b9ebb16d340.png",
      },
      { property: "og:url", content: "https://laila.cg" },
      { property: "og:site_name", content: "Laïla Music" },

      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Bienvenu chez Laila Music" },
      {
        name: "twitter:description",
        content:
          "Découvrez et téléchargez de la musique de Laïla Music - Albums, singles et titres exclusifs",
      },
      {
        name: "twitter:image",
        content:
          "https://horizons-cdn.hostinger.com/2250f31a-e042-4c1a-b279-00ce8467fe13/01e5922106e8cf5d12a63b9ebb16d340.png",
      },
    ],
  }),
  async beforeLoad() {
    try {
      const { data } = await authClient.getSession();
      return { session: data ?? null };
    } catch {
      return { session: null };
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Toaster />
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
