import type { Donation } from "@alveusgg/donations-core";
import { parse, stringify } from "superjson";
import { createSiteApi } from "../utils/site-api";

export interface DonationStorage {
  add: (...donations: Donation[]) => Promise<number>;
  /** Delete donations and their pixels, e.g. after a payment failed. */
  remove: (
    provider: string,
    providerUniqueId: string,
    reason: string,
  ) => Promise<{ donations: number; pixels: number }>;
  config: {
    set: (providerId: string, value: unknown | undefined) => void;
    get: <T>(providerId: string) => T | undefined;
  };
}

export class DurableObjectDonationStorage implements DonationStorage {
  constructor(
    private ctx: DurableObjectState,
    private env: Env,
  ) {}

  async remove(provider: string, providerUniqueId: string, reason: string) {
    const removed = await createSiteApi(
      this.env,
    ).donations.removeDonations.mutate({
      donations: [{ provider, providerUniqueId }],
      reason,
    });
    // Release the reservation, so the donation is imported again if the
    // payment is retried and succeeds.
    this.ctx.storage.sql.exec(
      `DELETE FROM donations WHERE provider = ? AND providerUniqueId = ?`,
      provider,
      providerUniqueId,
    );
    if (removed.pixels > 0) {
      const mural = this.env.PIXELS_MANAGER.getByName(
        `alveus-${this.env.MURAL_ID}`,
      );
      const response = await mural.fetch("https://pixels/resync", {
        method: "POST",
        headers: { Authorization: `ApiKey ${this.env.SHARED_KEY}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to resync pixels: ${response.status}`);
      }
    }
    console.info("Removed donation", { providerUniqueId, reason, ...removed });
    return removed;
  }

  async add(...donations: Donation[]) {
    const messages: MessageSendRequest<string>[] = [];
    for (const donation of donations) {
      const reservation = reserveDonation(
        this.ctx.storage.sql,
        donation.provider,
        donation.providerUniqueId,
      );
      if (reservation.new) {
        messages.push({
          body: stringify(donation),
          contentType: "json",
        });
      }
    }

    if (messages.length > 0) {
      this.ctx.waitUntil(this.env.DONATION_QUEUE.sendBatch(messages));
    }

    return messages.length;
  }

  config = {
    get: <T>(providerId: string) => {
      const cursor = this.ctx.storage.sql.exec(
        `SELECT metadata FROM providerMetadata WHERE provider = ?`,
        providerId,
      );
      const result = cursor.next();
      if (result.done) {
        return undefined;
      }
      return parse(result.value.metadata as string) as T;
    },
    set: async (providerId: string, value: unknown | undefined) => {
      if (value === undefined) {
        this.ctx.storage.sql.exec(
          ` DELETE FROM providerMetadata WHERE provider = ? `,
          providerId,
        );
        return;
      }
      const metadata = stringify(value);
      console.log(`Setting metadata for ${providerId} to ${metadata}`);
      this.ctx.storage.sql.exec(
        `REPLACE INTO providerMetadata (provider, metadata) VALUES (?, ?)`,
        providerId,
        metadata,
      );
    },
  };
}

export async function createIfNotExistsDonationsTable(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      provider TEXT NOT NULL,
      providerUniqueId TEXT PRIMARY KEY,
      date TEXT NOT NULL
    );
  `);
}

export async function createIfNotExistsProviderMetadataTable(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS providerMetadata (
      provider TEXT PRIMARY KEY,
      metadata TEXT NOT NULL
    );
  `);
}

function reserveDonation(
  sql: SqlStorage,
  provider: string,
  providerUniqueId: string,
): { new: true; date: string } | { new: false } {
  const date = new Date().toISOString();
  const cursor = sql.exec(
    `
      INSERT INTO donations (provider, providerUniqueId, date)
      VALUES (?, ?, ?)
      ON CONFLICT(providerUniqueId) DO NOTHING
      RETURNING date
    `,
    provider,
    providerUniqueId,
    date,
  );

  const result = cursor.next();
  if (!result.done) {
    return { new: true, date: result.value.date as string };
  }

  console.log(`Donation ${providerUniqueId} already exists`);
  return { new: false };
}
