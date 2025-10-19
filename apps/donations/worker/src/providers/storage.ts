import type { Donation } from "@alveusgg/donations-core";
import { stringify } from "superjson";

export interface DonationStorage {
  add: (...donations: Donation[]) => void;
  config: {
    set: (providerId: string, value: unknown | undefined) => Promise<void>;
    get: <T>(providerId: string) => Promise<T | undefined>;
  };
}

export class DurableObjectDonationStorage implements DonationStorage {
  constructor(
    private cacheKey: string,
    private ctx: DurableObjectState,
    private queue: Queue,
  ) {}

  add(...donations: Donation[]) {
    const messages = donations.map((donation) => ({
      body: stringify(donation),
      contentType: "json" as const,
    }));

    this.ctx.waitUntil(this.queue.sendBatch(messages));
  }

  config = {
    get: async <T>(providerId: string) => {
      return this.ctx.storage.get<T>(`${this.cacheKey}:${providerId}:config`);
    },
    set: async (providerId: string, value: unknown | undefined) => {
      if (value === undefined) {
        this.ctx.storage.delete(`${this.cacheKey}:${providerId}:config`);
        return;
      }
      this.ctx.storage.put(`${this.cacheKey}:${providerId}:config`, value);
    },
  };
}
