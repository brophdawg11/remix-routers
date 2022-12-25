import { resolve } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },

  resolve: {
    alias: {
      "~": resolve(__dirname, "./reference-app"),
      "remix-router-solid": resolve(__dirname, "src/index.ts"),
    },
  },
});
