import { bindings, defineConfig, exports } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "manager",
    compatibilityDate: "2026-09-25",
    entrypoint,
    exports: {
      CamControllerDurableObject: exports.durableObject({ storage: "sqlite" }),
      TwitchChat: exports.durableObject({ storage: "sqlite" }),
    },
    env: {
      WORLD: bindings.text("World"),
      CONTROL_API: bindings.vpcService({ id: "" }),
      TWITCH_EVENTSUB_SECRET: bindings.secret(),
    },
  },
});
