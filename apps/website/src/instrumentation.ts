import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getSentryConfig } = await import("@/server/utils/sentry");

    // Skip init entirely without a DSN, as even a disabled client sets up OpenTelemetry
    const config = getSentryConfig();
    if (config.enabled !== false) {
      Sentry.init(config);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
