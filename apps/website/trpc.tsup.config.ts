import { defineConfig } from "tsup";

const config = defineConfig({
  entry: {
    trpc: "src/server/trpc/router/_app.ts",
  },
  outDir: "dist",
  format: "esm",
  dts: {
    only: true,
    compilerOptions: {
      incremental: false,
    },
  },
  clean: false,
});

export default config;
