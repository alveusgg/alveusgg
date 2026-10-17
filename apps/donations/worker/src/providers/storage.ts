import type { Donation } from "@alveusgg/donations-core";
import { parse, stringify } from "superjson";
import { createSiteApi } from "../utils/site-api";

const PIXELS_RESYNC_CONFIG_KEY = "pixels-resync-pending";

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

  // Deliveries and removals run one at a time, so a removal can never finish
  // while a delivery of the same donation is still writing to the website.
  private exclusiveTail: Promise<unknown> = Promise.resolve();
  private exclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = this.exclusiveTail.then(task, task);
    this.exclusiveTail = run.catch(() => undefined);
    return run;
  }

  /** Write queued donations to the website, unless they were cancelled. */
  deliverDonations(donations: Donation[]) {
    return this.exclusive(async () => {
      const kept = this.filterCancelled(donations);
      if (kept.length) {
        await createSiteApi(this.env).donations.createDonations.mutate({
          donations: kept,
        });
      }
      return kept;
    });
  }

  /** Allocate pixels for queued donations, unless they were cancelled. */
  deliverPixels(donations: Donation[]) {
    return this.exclusive(async () => {
      const kept = this.filterCancelled(donations);
      if (kept.length) {
        await this.env.PIXELS_MANAGER.getByName(
          `alveus-${this.env.MURAL_ID}`,
        ).process(kept);
      }
      return kept;
    });
  }

  remove(provider: string, providerUniqueId: string, reason: string) {
    return this.exclusive(() =>
      this.removeNow(provider, providerUniqueId, reason),
    );
  }

  private async removeNow(
    provider: string,
    providerUniqueId: string,
    reason: string,
  ) {
    // Cancel first, so a queued donation that is delivered after this
    // removal is dropped instead of recreating it.
    this.ctx.storage.sql.exec(
      `REPLACE INTO cancelledDonations (provider, providerUniqueId, cancelledAt)
       VALUES (?, ?, ?)`,
      provider,
      providerUniqueId,
      new Date().toISOString(),
    );
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
      this.config.set(PIXELS_RESYNC_CONFIG_KEY, true);
    }
    await this.resyncNow();
    console.info("Removed donation", { providerUniqueId, reason, ...removed });
    return removed;
  }

  /**
   * Resync the mural after pixels were removed. Persisted, so a failed resync
   * is retried by later removals and syncs instead of being lost. Runs in
   * turn with removals, so an older resync cannot clear a newer pending one.
   */
  resyncPixelsIfPending() {
    return this.exclusive(() => this.resyncNow());
  }

  private async resyncNow() {
    if (!this.config.get<boolean>(PIXELS_RESYNC_CONFIG_KEY)) return;

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
    this.config.set(PIXELS_RESYNC_CONFIG_KEY, undefined);
  }

  /** Drop queued donations that were cancelled after they were queued. */
  private filterCancelled(donations: Donation[]) {
    return donations.filter((donation) => {
      const cursor = this.ctx.storage.sql.exec<{ cancelledAt: string }>(
        `SELECT cancelledAt FROM cancelledDonations
         WHERE provider = ? AND providerUniqueId = ?`,
        donation.provider,
        donation.providerUniqueId,
      );
      const row = cursor.next();
      if (row.done) return true;

      const cancelled =
        new Date(donation.receivedAt).getTime() <=
        Date.parse(row.value.cancelledAt);
      if (cancelled) {
        console.info("Dropping cancelled donation from queue", {
          providerUniqueId: donation.providerUniqueId,
        });
      }
      return !cancelled;
    });
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

export async function createIfNotExistsCancelledDonationsTable(
  sql: SqlStorage,
) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS cancelledDonations (
      provider TEXT NOT NULL,
      providerUniqueId TEXT PRIMARY KEY,
      cancelledAt TEXT NOT NULL
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
