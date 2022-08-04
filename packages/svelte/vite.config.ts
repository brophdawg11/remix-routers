import { resolve } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

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
