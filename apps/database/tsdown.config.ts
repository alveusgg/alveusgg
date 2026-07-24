import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  sourcemap: true,
  deps: {
    neverBundle: [/^@prisma\//],
  },
  outExtensions: () => ({
    js: ".js",
    dts: ".d.ts",
  }),
  target: false,
});
