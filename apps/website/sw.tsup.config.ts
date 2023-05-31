import { defineConfig } from "tsup";
import "./build-scripts/env.mjs";
import { env } from "@/env/index.mjs";

export default defineConfig((options) => ({
  entry: {
    "push/alveus/PushServiceWorker": "src/sw/PushServiceWorker.ts",
    //RootServiceWorker: "src/sw/RootServiceWorker.ts",
  },
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  noExternal: [/.*/],
  minify: !options.watch,
  platform: "browser",
  outDir: "public/",
  tsconfig: "src/sw/tsconfig.json",
  esbuildOptions(options, _context) {
    options.define = {
      ...Object.fromEntries(
        Object.entries(env)
          .filter(
            ([, value]) =>
              value !== undefined && value.startsWith("NEXT_PUBLIC_")
          )
          .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
      ),
    };
  },
}));
