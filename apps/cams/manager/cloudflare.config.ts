import { bindings, defineConfig, exports } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig(({ mode }) => ({
  worker: {
    name: mode === "preview" ? "manager-preview" : "manager",
    compatibilityDate: "2026-09-25",
    entrypoint,
    exports: {
      CamControllerDurableObject: exports.durableObject({ storage: "sqlite" }),
    },
    env: {
      CONTROL_API: bindings.vpcService({
        id: "01a0f446-3517-7a73-9542-da6a00a1b0e5",
        dev: { remote: true },
      }),
      CONTROL_API_TOKEN: bindings.secret(),
      ALVEUS_AUTH_ISSUER: bindings.text("https://www.alveussanctuary.org"),
    },
  },
}));
