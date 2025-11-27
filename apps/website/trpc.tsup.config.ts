import { defineConfig } from "tsup";

const config = defineConfig({
  entry: {
    trpc: "src/server/trpc/router/_app.ts",
  },
  outDir: "dist",
  format: "esm",
  dts: {
    only: true,
  },
  clean: true,
  tsconfig: "./trpc.tsconfig.json",
});

export default config;
