import type { TheGivingBlockConfig } from "@/data/the-giving-block";

declare global {
  interface Window {
    // Twitch API
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Twitch: any;

    // The Giving Block Donation Widget
    tgbWidgetOptions: TheGivingBlockConfig & { scriptId: string };
  }
}
