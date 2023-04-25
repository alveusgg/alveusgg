import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import "./build-scripts/env.mjs";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    watchExclude: [".web-push-vapid.json"],
  },
});
