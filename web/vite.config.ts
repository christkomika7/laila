import { defineConfig, loadEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      viteReact(),
    ],

    server: {
      host: true,
      port: Number(env.VITE_CLIENT_PORT),
      allowedHosts: [env.VITE_DOMAIN],
      proxy: {
        "/api": {
          target: env.VITE_SERVER_HOST,
          changeOrigin: true,
        },
      },
    },
  };
});
