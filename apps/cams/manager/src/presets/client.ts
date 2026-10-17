import type { AppRouter } from "@alveusgg/alveusgg-website";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import superjson from "superjson";

export function presetWebsite(env: Env) {
  if (!env.SITE_URL || !env.SITE_SHARED_KEY)
    throw new Error("Preset delivery is not configured.");
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${env.SITE_URL.replace(/\/$/, "")}/api/trpc`,
        transformer: superjson,
        headers: { Authorization: `ApiKey ${env.SITE_SHARED_KEY}` },
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
      }),
    ],
  });
}

export type PresetWebsite = ReturnType<typeof presetWebsite>;
