import type { Donation } from "@alveusgg/donations-core";
import { stringify } from "superjson";

export interface DonationStorage {
  add: (...donations: Donation[]) => Promise<void>;
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

  async add(...donations: Donation[]) {
    const messages: MessageSendRequest<string>[] = [];
    for (const donation of donations) {
      const date = await this.ctx.storage.get(donation.providerUniqueId);
      if (!date) {
        await this.ctx.storage.put(
          donation.providerUniqueId,
          new Date().toISOString(),
        );
        messages.push({
          body: stringify(donation),
          contentType: "json",
        });
      } else {
        console.log(`Donation ${donation.providerUniqueId} already exists`);
      }
    }
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
