import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "cloudflare:workers": fileURLToPath(
        new URL("./__tests__/fixtures/cloudflare-workers.ts", import.meta.url),
      ),
    },
  },
});
