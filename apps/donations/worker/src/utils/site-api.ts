import type { AppRouter } from "@alveusgg/alveusgg-website";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import superjson from "superjson";

export function createSiteApi(env: Env) {
  const headers: Record<string, string> = {};
  if (env.OPTIONAL_VERCEL_PROTECTION_BYPASS) {
    headers["x-vercel-protection-bypass"] =
      env.OPTIONAL_VERCEL_PROTECTION_BYPASS;
  }

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${env.SITE_URL}/api/trpc`,
        transformer: superjson,
        headers: {
          Authorization: `ApiKey ${env.SHARED_KEY}`,
          ...headers,
        },
      }),
    ],
  });
}
