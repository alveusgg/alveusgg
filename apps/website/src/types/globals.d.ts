import type { TheGivingBlockConfig } from "@/data/the-giving-block";

declare global {
  interface Window {
    // Twitch API
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    /* biome-ignore lint/suspicious/noExplicitAny: */
    Twitch: any;

    // The Giving Block Donation Widget
    tgbWidgetOptions: TheGivingBlockConfig;
  }
}
