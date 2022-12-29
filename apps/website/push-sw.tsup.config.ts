import { defineConfig } from "tsup";
import "./tsup-env";
import { env } from "./src/env/client.mjs";

const vapidPublicB64 = Buffer.from(
  process.env.WEB_PUSH_VAPID_PUBLIC_KEY || "",
  "utf-8"
).toString("base64url");

export default defineConfig((options) => ({
  entry: ["src/AlveusPushWorker.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  noExternal: [/.*/],
  minify: !options.watch,
  platform: "browser",
  outDir: "public/push/alveus",
  tsconfig: "tsconfig.push-sw.json",
  esbuildOptions(options, context) {
    options.define = {
      "process.env.VAPID_PUBLIC_KEY": JSON.stringify(vapidPublicB64),
      "process.env.PORT": JSON.stringify(process.env.PORT),
      "process.env.VERCEL_URL": JSON.stringify(process.env.VERCEL_URL),
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => {
          return [`process.env.${key}`, JSON.stringify(value)];
        })
      ),
    };
  },
}));
