import { getDonation, searchDonations } from "@alveusgg/neon-crm-api";

import { env } from "@/env";

import {
  getNeonDonationsForSync,
  updateNeonDonationAccounts,
} from "@/server/db/donations";
import { RedisValueAlreadyExistsError, getRedis } from "@/server/utils/redis";

const SYNC_INTERVAL_SECONDS = 15 * 60;
const MAX_PAGES = 10;
const PAGE_SIZE = 200;
const CACHE_WRITE_TIMEOUT_MS = 2_000;

async function withCacheWriteTimeout(operation: Promise<void>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Neon donation sync cache write timed out"));
        }, CACHE_WRITE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function syncNeonDonationAccounts(accountId: string) {
  if (!env.NEON_CRM_API_KEY) return;

  const redis = getRedis();
  const key = `neon-donation-sync:${env.NEXT_PUBLIC_BASE_URL}:${env.NEON_CRM_ORG_ID}:${accountId}`;
  try {
    // This short lease also throttles retries after failures. Only a completed
    // sync extends it to the full interval.
    await withCacheWriteTimeout(
      redis.set(key, "pending", { expiry: 60, overwrite: false }),
    );
  } catch (error) {
    if (error instanceof RedisValueAlreadyExistsError) return;
    throw error;
  }

  const options = {
    baseUrl: "https://api.neoncrm.com/v2/",
    organizationId: env.NEON_CRM_ORG_ID,
    apiKey: env.NEON_CRM_API_KEY,
    localTimezone: "America/Chicago",
    signal: AbortSignal.timeout(10_000),
  };
  const prefix = `${options.organizationId}-`;
  const owners = new Map<string, string>();
  let totalResults = 0;
  let pageSize = PAGE_SIZE;
  for (let page = 0, pages = 1; page < pages; page++) {
    const response = await searchDonations(options, {
      searchFields: [
        { field: "Account ID", operator: "EQUAL", value: accountId },
      ],
      outputFields: ["Donation ID", "Account ID"],
      pagination: {
        currentPage: page,
        pageSize: PAGE_SIZE,
        sortColumn: "Donation ID",
        sortDirection: "ASC",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch Neon account donations", {
        cause:
          response.error instanceof Error
            ? response.error
            : new Error(response.error),
      });
    }

    const { searchResults, pagination } = response.data;
    if (
      !Number.isSafeInteger(pagination.totalPages) ||
      pagination.totalPages < 0 ||
      pagination.totalPages > MAX_PAGES ||
      pagination.currentPage !== page
    ) {
      throw new Error("Neon account donation pagination exceeded sync limits");
    }
    if (page === 0) {
      pages = pagination.totalPages;
      totalResults = pagination.totalResults;
      pageSize = pagination.pageSize;
    }
    if (
      !Number.isSafeInteger(totalResults) ||
      totalResults < 0 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > PAGE_SIZE ||
      pagination.totalPages !== pages ||
      pagination.totalResults !== totalResults ||
      pagination.pageSize !== pageSize ||
      (pages !== Math.ceil(totalResults / pageSize) &&
        !(totalResults === 0 && pages === 1)) ||
      searchResults.length !==
        Math.min(pageSize, totalResults - page * pageSize)
    ) {
      throw new Error("Neon donation history is incomplete or inconsistent");
    }
    for (const donation of searchResults) {
      const id = donation["Donation ID"];
      if (typeof id !== "string" || !/^\d+$/.test(id)) {
        throw new Error("Neon returned an invalid donation ID");
      }
      const owner = donation["Account ID"];
      if (owner !== accountId) {
        throw new Error(
          "Neon returned a donation belonging to another account",
        );
      }
      owners.set(`${prefix}${id}`, owner);
    }
  }
  if (owners.size !== totalResults) {
    throw new Error("Neon donation history is incomplete or inconsistent");
  }

  const existing = await getNeonDonationsForSync(
    options.organizationId,
    accountId,
    [...owners.keys()],
  );
  const changes: { id: string; accountId: string | null }[] = [];
  for (const donation of existing) {
    let owner: string | null | undefined = owners.get(
      donation.providerUniqueId,
    );
    if (owner === undefined) {
      // A locally linked donation missing from the complete list may have
      // moved to another account. Verify it rather than guessing its owner.
      const id = donation.providerUniqueId.slice(prefix.length);
      const response = await getDonation(options, id);
      if (response.ok) {
        if (response.data.id !== id) {
          throw new Error("Neon returned an unexpected donation ID");
        }
        owner = response.data.accountId;
      } else if (response.errorType === "request" && response.status === 404) {
        owner = null;
      } else {
        throw new Error("Failed to verify Neon donation ownership", {
          cause:
            response.error instanceof Error
              ? response.error
              : new Error(response.error),
        });
      }
    }
    const metadata = donation.providerMetadata as { neonAccountId?: string };
    if (metadata.neonAccountId !== owner) {
      changes.push({ id: donation.id, accountId: owner });
    }
  }

  // No writes until the full list and any missing donations were verified.
  options.signal.throwIfAborted();
  if (changes.length) await updateNeonDonationAccounts(changes);
  await withCacheWriteTimeout(
    redis.set(key, "complete", { expiry: SYNC_INTERVAL_SECONDS }),
  );
}
