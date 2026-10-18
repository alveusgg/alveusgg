// Preloaded before the app (`tsx --import ./src/instrument.ts`) so that Sentry
// can hook into modules before they are loaded, which is required under ESM.
import * as Sentry from "@sentry/node";

import { getSentryConfig } from "@/utils/sentry";

// Skip init entirely without a DSN, as even a disabled client sets up OpenTelemetry
const config = getSentryConfig();
if (config.enabled !== false) {
  Sentry.init(config);
}
