import * as Sentry from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";

import { env } from "@/env";

export function getSentryConfig(): Sentry.NodeOptions {
  if (!env.SENTRY_DSN) {
    return { enabled: false };
  }

  return {
    dsn: env.SENTRY_DSN,
    environment:
      env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || env.NODE_ENV,
    release: env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  };
}

/**
 * Report an error that we handle ourselves (so Next.js' `onRequestError` never sees it),
 * and keep the function alive until it has been sent, like `onRequestError` does.
 */
export function captureException(
  ...args: Parameters<typeof Sentry.captureException>
) {
  Sentry.captureException(...args);
  waitUntil(Sentry.flush(2_000));
}
