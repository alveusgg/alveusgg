import { defineConfig } from "tsup";
import "./build-scripts/env.mjs";
import { env } from "@/env/client.mjs";

const vapidPublicB64 = Buffer.from(
  process.env.WEB_PUSH_VAPID_PUBLIC_KEY || "",
  "utf-8"
).toString("base64url");

export default defineConfig((options) => ({
  entry: {
    "push/alveus/PushServiceWorker": "src/sw/PushServiceWorker.ts",
    RootServiceWorker: "src/sw/RootServiceWorker.ts",
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
      "process.env.VAPID_PUBLIC_KEY": JSON.stringify(vapidPublicB64),
      "process.env.PORT": JSON.stringify(process.env.PORT ?? 3000),
      "process.env.VERCEL_URL": JSON.stringify(
        process.env.VERCEL_URL ?? "localhost"
      ),
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => {
          return [`process.env.${key}`, JSON.stringify(value)];
        })
      ),
    };
  },
}));
