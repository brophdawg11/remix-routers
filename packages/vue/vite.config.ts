import path from "path";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import packageJson from "./package.json";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [vue()],
    build: {
      lib: {
        entry: "src/index.ts",
        name: "RemixRouterVue",
        // eslint-disable-next-line
        fileName: (format) => `${packageJson.name}.${format}.js`,
      },
      rollupOptions: {
        external: ["@remix-run/router", "vue"],
        output: {
          globals: {
            "@remix-run/router": "Router",
            vue: "Vue",
          },
        },
      },
    },
    resolve: {
      alias: {
        // eslint-disable-next-line
        "remix-router-vue": path.resolve(__dirname, "src/index.ts"),
      },
      dedupe: ["vue"],
    },
    server: {
      hmr: mode === "development",
    },
    clearScreen: command === "serve" && mode === "development",
  };
});
