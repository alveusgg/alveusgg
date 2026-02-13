import type { CloudflareOptions } from "@sentry/cloudflare";

export function getSentryConfig(env: Env): CloudflareOptions {
  return {
    dsn: env.SENTRY_DSN,
    environment: env.SANDBOX ? "preview" : "production",
    release: env.SENTRY_RELEASE,
  };
}
