import type { Providers } from "@alveusgg/donations-core";

export abstract class DonationProvider {
  abstract name: Providers;
  static init: () => Promise<void>;
  abstract handle: (request: Request) => Promise<Response>;
}
