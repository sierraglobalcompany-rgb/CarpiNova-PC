import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "generated",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts"
  }
});
