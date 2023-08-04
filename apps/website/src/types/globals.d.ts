import type { TheGivingBlockConfig } from "@/config/the-giving-block";

declare global {
  interface Window {
    // Twitch API
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Twitch: any;

    // The Giving Block Donation Widget
    tgbWidgetOptions: TheGivingBlockConfig;
  }
}
