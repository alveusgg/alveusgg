import { defineConfig } from "vitest/config";

// Explicit opt-in: ordinary `pnpm test` never runs camera mutations.
export default defineConfig({
  test: { include: ["dev/smoke.integration.ts"], testTimeout: 15000 },
});
