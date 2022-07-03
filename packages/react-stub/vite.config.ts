import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "~": resolve(__dirname, "./reference-app"),
      },
    },
    server: {
      hmr: mode === "development",
      open: command === "serve" || mode === "development",
    },
    clearScreen: command === "serve" && mode === "development",
  };
});
