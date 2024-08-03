import { defineConfig } from "tsup";

import "./build-scripts/env";
import { env } from "@/env";

const config = defineConfig((options) => ({
  entry: {
    "push/alveus/PushServiceWorker": "src/sw/PushServiceWorker.ts",
  },
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  noExternal: [/.*/],
  minify: !options.watch,
  platform: "browser",
  outDir: "public/",
  format: "esm",
  tsconfig: "src/sw/tsconfig.json",
  esbuildOptions(options, _context) {
    options.define = {
      ...Object.fromEntries(
        Object.entries(env)
          .filter(
            ([key, value]) =>
              key.startsWith("NEXT_PUBLIC_") && value !== undefined,
          )
          .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    };
  },
}));

export default config;
