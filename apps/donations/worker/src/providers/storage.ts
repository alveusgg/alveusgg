import type { Donation } from "@alveusgg/donations-core";
import { parse, stringify } from "superjson";

export interface DonationStorage {
  add: (...donations: Donation[]) => void;
  config: {
    set: (providerId: string, value: unknown | undefined) => void;
    get: <T>(providerId: string) => T | undefined;
  };
}

export class DurableObjectDonationStorage implements DonationStorage {
  constructor(
    private ctx: DurableObjectState,
    private queue: Queue,
  ) {}

  async add(...donations: Donation[]) {
    const messages: MessageSendRequest<string>[] = [];
    for (const donation of donations) {
      const exists = doesDonationExist(
        this.ctx.storage.sql,
        donation.providerUniqueId,
      );
      if (!exists) {
        messages.push({
          body: stringify(donation),
          contentType: "json",
        });
      }
    }

    this.ctx.waitUntil(this.queue.sendBatch(messages));
  }

  config = {
    get: <T>(providerId: string) => {
      const cursor = this.ctx.storage.sql.exec(
        `SELECT metadata FROM providerMetadata WHERE provider = ?`,
        providerId,
      );
      if (cursor.rowsRead === 0) {
        return undefined;
      }
      const result = cursor.one();
      return parse(result.metadata as string) as T;
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

function doesDonationExist(sql: SqlStorage, providerUniqueId: string) {
  const cursor = sql.exec(
    `SELECT date FROM donations WHERE providerUniqueId = ? LIMIT 1`,
    providerUniqueId,
  );

  if (cursor.rowsRead === 0) {
    return false;
  }
  const result = cursor.one();
  console.log(
    `Donation ${providerUniqueId} already exists, it was created at ${result.date}`,
  );
  return true;
}
