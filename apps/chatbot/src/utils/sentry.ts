import {
  onUnhandledRejectionIntegration,
  type NodeOptions,
} from "@sentry/node";

import { env } from "@/env";

export function getSentryConfig(): NodeOptions | undefined {
  if (!env.SENTRY_DSN) {
    return undefined;
  }

  return {
    dsn: env.SENTRY_DSN,
    // Deploys always set SENTRY_ENVIRONMENT (production or preview), so
    // anything else is a local run. NODE_ENV defaults to production here.
    environment: env.SENTRY_ENVIRONMENT || "development",
    release: env.SENTRY_RELEASE || process.env.CHATBOT_REF_SHA || undefined,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
    },
    integrations: [
      // Sentry reports unhandled rejections by default, but then only warns
      // instead of exiting like Node does; keep exiting so Docker restarts us
      onUnhandledRejectionIntegration({ mode: "strict" }),
    ],
  };
}
