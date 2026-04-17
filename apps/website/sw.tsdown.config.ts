import { defineConfig } from "tsdown";

import "./build-scripts/env.js";

import { env } from "./src/env/index.js";

const config = defineConfig((options) => ({
  entry: {
    PushServiceWorker: "src/sw/PushServiceWorker.ts",
  },
  outDir: "public/push/alveus",
  dts: false,
  outputOptions: {
    codeSplitting: false,
  },
  sourcemap: true,
  minify: !options.watch,
  platform: "browser" as const,
  deps: {
    alwaysBundle: [/.+/],
  },
  tsconfig: "src/sw/tsconfig.json",
  env: Object.fromEntries(
    Object.entries(env).filter(
      ([key, value]) => key.startsWith("NEXT_PUBLIC_") && value !== undefined,
    ),
  ),
}));

export default config;
