import { getAccountDonations, getDonation } from "@alveusgg/neon-crm-api";

import { env } from "@/env";

import {
  getNeonDonationsForSync,
  updateNeonDonationAccounts,
} from "@/server/db/donations";
import { RedisValueAlreadyExistsError, getRedis } from "@/server/utils/redis";

const SYNC_INTERVAL_SECONDS = 15 * 60;
const MAX_PAGES = 10;

export async function syncNeonDonationAccounts(accountId: string) {
  if (!env.NEON_CRM_API_KEY) return;

  const redis = getRedis();
  const key = `neon-donation-sync:${env.NEXT_PUBLIC_BASE_URL}:${env.NEON_CRM_ORG_ID}:${accountId}`;
  try {
    // This short lease also throttles retries after failures. Only a completed
    // sync extends it to the full interval.
    await redis.set(key, "pending", { expiry: 60, overwrite: false });
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
  for (let page = 0, pages = 1; page < pages; page++) {
    const response = await getAccountDonations(options, accountId, page);
    if (!response.ok) {
      throw new Error("Failed to fetch Neon account donations", {
        cause:
          response.error instanceof Error
            ? response.error
            : new Error(response.error),
      });
    }

    const { donations, pagination } = response.data;
    pages = pagination.totalPages;
    if (pages > MAX_PAGES || pagination.currentPage !== page) {
      throw new Error("Neon account donation pagination exceeded sync limits");
    }
    for (const donation of donations) {
      if (donation.accountId !== accountId) {
        throw new Error(
          "Neon returned a donation belonging to another account",
        );
      }
      owners.set(`${prefix}${donation.id}`, donation.accountId);
    }
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
  await redis.set(key, "complete", { expiry: SYNC_INTERVAL_SECONDS });
}
