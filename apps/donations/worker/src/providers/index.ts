import type { MiddlewareHandler } from "hono";
import type { Providers } from "@alveusgg/donations-core";

export abstract class DonationProvider {
  abstract name: Providers;
  middleware?: MiddlewareHandler = undefined;
  static init: () => Promise<void>;
  abstract handle: (request: Request) => Promise<Response>;
}
