import * as path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "remix-router-vue": path.resolve(__dirname, "../src/index.ts"),
    },
    dedupe: ["vue"],
  },
});
