import { resolve } from "path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [svelte()],
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
    open: command === "serve" && mode === "development",
  };
});
