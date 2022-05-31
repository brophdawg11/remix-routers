import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      hmr: mode === "development",
    },
    clearScreen: command === "serve" && mode === "development",
  };
});
