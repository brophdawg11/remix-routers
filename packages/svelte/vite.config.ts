import { resolve } from "path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

import packageJson from "./package.json";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [svelte()],
    build: {
      lib: {
        entry: "src/index.ts",
        name: "RemixRouterSvelte",
        // eslint-disable-next-line
        fileName: (format) => `${packageJson.name}.${format}.js`,
      },
      rollupOptions: {
        external: ["@remix-run/router", "svelte"],
        output: {
          globals: {
            "@remix-run/router": "Router",
            svelte: "Svelte",
          },
        },
      },
    },
    resolve: {
      alias: {
        "~": resolve(__dirname, "./reference-app"),
        "remix-router-svelte": resolve(__dirname, "src/index.ts"),
      },
      dedupe: ["svelte"],
    },
    server: {
      hmr: mode === "development",
    },
    clearScreen: command === "serve" && mode === "development",
  };
});
