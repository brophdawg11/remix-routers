import { resolve } from "path";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

import packageJson from "./package.json";
// import analyze from "rollup-plugin-analyzer";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [preact()],
    build: {
      lib: {
        entry: "src/index.ts",
        name: "RemixRouterPreact",
        // eslint-disable-next-line
        fileName: (format) => `${packageJson.name}.${format}.js`,
      },
      rollupOptions: {
        external: ["@remix-run/router", "preact"],
        output: {
          globals: {
            "@remix-run/router": "Router",
            preact: "Preact",
          },
        },
      },
      // rollupOptions: {
      //   plugins: [analyze({ summaryOnly: true })],
      // },
    },
    resolve: {
      alias: {
        "~": resolve(__dirname, "./reference-app"),
        "remix-router-preact": resolve(__dirname, "src/index.ts"),
      },
      dedupe: ["preact"],
    },
    server: {
      hmr: mode === "development",
      open: command === "serve" || mode === "development",
    },
    clearScreen: command === "serve" && mode === "development",
  };
});
