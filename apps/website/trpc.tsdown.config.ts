import { defineConfig } from "tsdown";

const config = defineConfig({
  entry: {
    trpc: "src/server/trpc/router/_app.ts",
  },
  outDir: "dist",
  dts: {
    emitDtsOnly: true,
  },
  deps: {
    neverBundle: [/^@prisma\//, /^@alveusgg\//],
  },
  outExtensions: () => ({
    dts: ".d.ts",
  }),
});

export default config;
