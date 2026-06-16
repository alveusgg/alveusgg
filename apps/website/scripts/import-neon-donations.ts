import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  type AccountDonation,
  type AccountResponse,
  getAccount,
  getAccountDonations,
} from "@alveusgg/neon-crm-api";
import { envToOptions } from "@alveusgg/neon-crm-api/env";
import { createId } from "@paralleldrive/cuid2";

import { prisma } from "@alveusgg/database";

import type { NeonDonation } from "@alveusgg/donations-core";

// CLI Arguments
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");
const help = process.argv.includes("--help");

const minAmount = Number(
  process.argv.find((arg) => arg.startsWith("--min-amount="))?.split("=")[1] ??
    95,
);
const concurrency = Number(
  process.argv.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ??
    2,
);
const maxPagesPerAccount = Number(
  process.argv
    .find((arg) => arg.startsWith("--max-pages-per-account="))
    ?.split("=")[1] ?? 10,
);
const ignoredAccountIds = new Set(
  (
    process.argv
      .find((arg) => arg.startsWith("--ignore-account-ids="))
      ?.split("=")[1] ?? ""
  )
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0),
);
const excludedOriginCategories = new Set(
  (
    process.argv
      .find((arg) => arg.startsWith("--exclude-origin-categories="))
      ?.split("=")[1] ?? "Self-Import"
  )
    .split(",")
    .map((category) => category.trim())
    .filter((category) => category.length > 0),
);
const limitArg = process.argv
  .find((arg) => arg.startsWith("--limit="))
  ?.split("=")[1];
const limit = limitArg ? Number(limitArg) : undefined;
const neonEnvFile =
  process.argv.find((arg) => arg.startsWith("--neon-env="))?.split("=")[1] ??
  "../donations/worker/.env";
const writeProviderUniqueIdsFile = process.argv
  .find((arg) => arg.startsWith("--write-provider-unique-ids="))
  ?.split("=")[1];

function printUsageHint() {
  console.error(
    "Usage: pnpm run murals:import-neon-donations [--help] [--dry-run] [--verbose] [--min-amount=95] [--limit=10] [--concurrency=2] [--ignore-account-ids=79,123] [--exclude-origin-categories=Self-Import] [--max-pages-per-account=10] [--write-provider-unique-ids=matched-neon-ids.txt] [--neon-env=../donations/worker/.env] <file>",
  );
}

if (help) {
  printUsageHint();
  process.exit(1);
}

if (!Number.isFinite(minAmount)) {
  console.error("Error: --min-amount must be a number.");
  process.exit(1);
}

if (!Number.isInteger(concurrency) || concurrency < 1) {
  console.error("Error: --concurrency must be a positive integer.");
  process.exit(1);
}

if (!Number.isInteger(maxPagesPerAccount) || maxPagesPerAccount < 1) {
  console.error("Error: --max-pages-per-account must be a positive integer.");
  process.exit(1);
}

if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
  console.error("Error: --limit must be a positive integer.");
  process.exit(1);
}

type CsvRow = {
  csvRow: number;
  account: string;
  accountId: string;
  amountCents: number;
  date: string;
  campaign: string;
  fund: string;
  status: string;
};

type ExactMatch = {
  row: CsvRow;
  donation: AccountDonation;
};

type AmbiguousMatch = {
  row: CsvRow;
  matches: AccountDonation[];
};

type UnmatchedRow = {
  row: CsvRow;
};

type OriginExcludedRow = {
  row: CsvRow;
  matches: AccountDonation[];
};

type AccountDonationsError = Exclude<
  Awaited<ReturnType<typeof getAccountDonations>>,
  { ok: true }
>;

type FetchError = {
  accountId: string;
  rows: CsvRow[];
  error: AccountDonationsError;
};

function loadEnvFile(filePath: string) {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) return;

  const content = readFileSync(resolved, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] ??= value;
  }
}

function getNeonOptions() {
  loadEnvFile(neonEnvFile);

  const {
    NEON_CRM_BASE_URL,
    NEON_CRM_ORG_ID,
    NEON_CRM_API_KEY,
    NEON_CRM_LOCAL_TIMEZONE = "America/Chicago",
    NEON_CRM_WEBHOOK_USERNAME,
    NEON_CRM_WEBHOOK_PASSWORD,
  } = process.env;

  if (!NEON_CRM_BASE_URL || !NEON_CRM_ORG_ID || !NEON_CRM_API_KEY) {
    throw new Error(
      "Missing Neon env. Expected NEON_CRM_BASE_URL, NEON_CRM_ORG_ID, and NEON_CRM_API_KEY.",
    );
  }

  return envToOptions({
    NEON_CRM_BASE_URL,
    NEON_CRM_ORG_ID,
    NEON_CRM_API_KEY,
    NEON_CRM_LOCAL_TIMEZONE,
    NEON_CRM_WEBHOOK_USERNAME,
    NEON_CRM_WEBHOOK_PASSWORD,
  });
}

async function main() {
  const fixedArgs = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith("--") && !arg.startsWith("-"));

  const filePath = fixedArgs[0]?.trim();
  if (!filePath) {
    console.error("Error: filePath is required.");
    printUsageHint();
    process.exit(1);
  }

  const fileContent = readFileSync(resolve(filePath), "utf-8");
  const csvRows = rowsToObjects(parseCsv(fileContent));
  const targetRows = collectTargetRows(csvRows).slice(0, limit);
  const ignoredRows = targetRows.filter((row) =>
    ignoredAccountIds.has(row.accountId),
  );
  const importRows = targetRows.filter(
    (row) => !ignoredAccountIds.has(row.accountId),
  );
  const rowsByAccount = Map.groupBy(importRows, (row) => row.accountId);
  const options = {
    ...getNeonOptions(),
    debug: verbose,
    fetchTimeoutMs: 10_000,
  };

  console.log(`Found ${csvRows.length} rows in the CSV file.`);
  console.log(
    `Found ${targetRows.length} successful Neon donation rows >= $${minAmount.toFixed(
      2,
    )}.`,
  );
  if (ignoredRows.length > 0) {
    console.log(
      `Ignoring ${ignoredRows.length} rows for account IDs: ${[
        ...ignoredAccountIds,
      ].join(", ")}`,
    );
  }
  if (excludedOriginCategories.size > 0) {
    console.log(
      `Excluding Neon donations with origin categories: ${[
        ...excludedOriginCategories,
      ].join(", ")}`,
    );
  }
  console.log(`Fetching donations for ${rowsByAccount.size} Neon accounts.`);

  const exactMatches: ExactMatch[] = [];
  const ambiguous: AmbiguousMatch[] = [];
  const unmatched: UnmatchedRow[] = [];
  const originExcluded: OriginExcludedRow[] = [];
  const fetchErrors: FetchError[] = [];

  await mapLimit(
    [...rowsByAccount.entries()],
    concurrency,
    async ([id, rows]) => {
      const response = await getAccountDonations(options, id, {
        maxPages: maxPagesPerAccount,
      });
      if (!response.ok) {
        fetchErrors.push({ accountId: id, rows, error: response });
        return;
      }

      for (const row of rows) {
        const csvMatches = response.data.filter((donation) =>
          neonDonationMatchesCsv(donation, row),
        );
        const matches = csvMatches.filter(
          (donation) => !isExcludedOriginDonation(donation),
        );

        if (matches.length === 1) {
          exactMatches.push({ row, donation: matches[0]! });
        } else if (matches.length > 1) {
          ambiguous.push({ row, matches });
        } else if (
          csvMatches.some((donation) => isExcludedOriginDonation(donation))
        ) {
          originExcluded.push({
            row,
            matches: csvMatches.filter((donation) =>
              isExcludedOriginDonation(donation),
            ),
          });
        } else {
          unmatched.push({ row });
        }
      }
    },
  );

  console.log(`Exact matches: ${exactMatches.length}`);
  console.log(`Ambiguous matches: ${ambiguous.length}`);
  console.log(`Origin-excluded rows: ${originExcluded.length}`);
  console.log(`Unmatched rows: ${unmatched.length}`);
  console.log(`Fetch errors: ${fetchErrors.length}`);

  let imported = 0;
  let skipped = 0;
  const accountCache = new Map<string, AccountResponse>();
  const importProviderUniqueIds: string[] = [];

  for (const { row, donation: neonDonation } of exactMatches.sort(
    (a, b) => a.row.csvRow - b.row.csvRow,
  )) {
    const providerUniqueId = `${options.organizationId}-${neonDonation.id}`;
    const existing = await prisma.donation.findUnique({
      where: { providerUniqueId },
      select: { id: true },
    });

    if (existing) {
      skipped++;
      if (verbose) {
        console.info(`Skipping existing donation ${providerUniqueId}`);
      }
      continue;
    }

    let account = accountCache.get(row.accountId);
    if (!account) {
      const accountResponse = await getAccount(options, row.accountId);
      if (!accountResponse.ok) {
        console.warn(
          `Skipping ${providerUniqueId}; failed to fetch account ${row.accountId}`,
          accountResponse,
        );
        skipped++;
        continue;
      }

      account = accountResponse.data;
      accountCache.set(row.accountId, account);
    }

    const backfilled = createDonation(
      options.organizationId,
      neonDonation,
      account,
      row,
    );
    if (!backfilled) {
      console.warn(
        `Skipping ${providerUniqueId}; matched Neon donation is missing campaign or fund data`,
      );
      skipped++;
      continue;
    }

    if (verbose || dryRun) {
      console.log("Inserting donation", backfilled);
    }

    if (!dryRun) {
      await prisma.donation.create({ data: backfilled });
    }

    importProviderUniqueIds.push(providerUniqueId);
    console.log(
      `Imported: ${row.account} (${formatDollars(row.amountCents)}) as ${providerUniqueId}`,
    );
    imported++;
  }

  if (ambiguous.length > 0) {
    console.warn("\nAmbiguous rows skipped:");
    console.table(
      ambiguous.map(({ row, matches }) => ({
        csvRow: row.csvRow,
        accountId: row.accountId,
        account: row.account,
        amount: formatDollars(row.amountCents),
        candidates: matches
          .map((match) => `${options.organizationId}-${match.id}`)
          .join(", "),
      })),
    );
  }

  if (unmatched.length > 0) {
    console.warn("\nUnmatched rows skipped:");
    console.table(
      unmatched.map(({ row }) => ({
        csvRow: row.csvRow,
        accountId: row.accountId,
        account: row.account,
        amount: formatDollars(row.amountCents),
        date: row.date,
      })),
    );
  }

  if (originExcluded.length > 0) {
    console.warn("\nOrigin-excluded rows skipped:");
    console.table(
      originExcluded.map(({ row, matches }) => ({
        csvRow: row.csvRow,
        accountId: row.accountId,
        account: row.account,
        amount: formatDollars(row.amountCents),
        date: row.date,
        origins: [
          ...new Set(
            matches.map(
              (match) => match.origin?.originCategory ?? "(missing origin)",
            ),
          ),
        ].join(", "),
        candidates: matches
          .map((match) => `${options.organizationId}-${match.id}`)
          .join(", "),
      })),
    );
  }

  if (fetchErrors.length > 0) {
    console.warn("\nFetch errors skipped:");
    console.table(
      fetchErrors.map(({ accountId, rows, error }) => ({
        accountId,
        csvRows: rows.map((row) => row.csvRow).join(", "),
        errorType: error.errorType,
        error:
          error.errorType === "parse"
            ? error.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")
            : error.error,
      })),
    );
  }

  if (ignoredRows.length > 0) {
    console.warn("\nIgnored rows skipped:");
    console.table(
      ignoredRows.map((row) => ({
        csvRow: row.csvRow,
        accountId: row.accountId,
        account: row.account,
        amount: formatDollars(row.amountCents),
        date: row.date,
      })),
    );
  }

  if (writeProviderUniqueIdsFile) {
    writeFileSync(
      resolve(writeProviderUniqueIdsFile),
      `${importProviderUniqueIds.join("\n")}\n`,
    );
    console.log(
      `Wrote ${importProviderUniqueIds.length} providerUniqueIds to ${writeProviderUniqueIdsFile}`,
    );
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

function createDonation(
  organizationId: string,
  data: AccountDonation,
  account: AccountResponse,
  row: CsvRow,
) {
  if (!data.campaign) return undefined;

  const donatedAt = data.timestamps.createdDateTime;
  const fundId = data.fund?.id ?? process.env.NEON_PIXEL_FUND_ID;
  const fundName = data.fund?.name ?? row.fund;

  return {
    id: createId(),
    provider: "neon",
    providerUniqueId: `${organizationId}-${data.id}`,
    providerMetadata: {
      neonCampaignId: data.campaign.id ?? undefined,
      neonCampaignName: data.campaign.name ?? undefined,
      neonFundId: fundId ?? undefined,
      neonFundName: fundName || undefined,
      neonAccountId: data.accountId ?? undefined,
    },
    amount: toCents(data.amount),
    receivedAt: donatedAt,
    donatedAt,
    donatedBy: {
      primary: "displayName",
      displayName: extractDisplayName(data, account),
      email:
        account.individualAccount?.primaryContact.email1 ??
        account.companyAccount?.primaryContact.email1 ??
        undefined,
      firstName:
        account.individualAccount?.primaryContact.firstName ?? undefined,
      lastName: account.individualAccount?.primaryContact.lastName ?? undefined,
      username:
        account.individualAccount?.login?.username ??
        account.companyAccount?.login?.username ??
        undefined,
    },
    tags: {
      fund: String(fundId ?? ""),
      campaign: String(data.campaign.id),
      donorCoveredFee: data.donorCoveredFeeFlag ? "yes" : "no",
      anonymous: data.anonymousType ? "yes" : "no",
      payLater: data.payLater ? "yes" : "no",
    },
  } satisfies NeonDonation;
}

function isExcludedOriginDonation(donation: AccountDonation) {
  const originCategory = donation.origin?.originCategory;
  return (
    originCategory !== undefined &&
    originCategory !== null &&
    excludedOriginCategories.has(originCategory)
  );
}

function extractDisplayName(data: AccountDonation, account: AccountResponse) {
  if (data.anonymousType) {
    return "Anonymous";
  }

  const displayNameField = data.donationCustomFields?.find(
    (field) =>
      field.id === process.env.NEON_DONATION_DISPLAY_NAME_CUSTOM_FIELD_ID,
  );
  if (
    displayNameField &&
    "value" in displayNameField &&
    displayNameField.value.trim() !== ""
  ) {
    return displayNameField.value.trim();
  }

  if (account.individualAccount) {
    if (account.individualAccount.primaryContact.preferredName) {
      return account.individualAccount.primaryContact.preferredName;
    }

    if (account.individualAccount.primaryContact.firstName) {
      return account.individualAccount.primaryContact.firstName;
    }
  }

  if (account.companyAccount) {
    if (account.companyAccount.name) {
      return account.companyAccount.name;
    }

    if (account.companyAccount.primaryContact.preferredName) {
      return account.companyAccount.primaryContact.preferredName;
    }

    if (account.companyAccount.primaryContact.firstName) {
      return account.companyAccount.primaryContact.firstName;
    }
  }

  return "Anonymous";
}

function collectTargetRows(rows: Record<string, string>[]) {
  return rows
    .map((row, index) => ({
      csvRow: index + 2,
      account: String(row.Account ?? "").trim(),
      accountId: String(row["Account ID"] ?? "").trim(),
      amountCents: parseAmountCents(row.Amount ?? ""),
      date: String(row.Date ?? "").trim(),
      campaign: String(row.Campaign ?? "").trim(),
      fund: String(row.Fund ?? "").trim(),
      status: String(row.Status ?? "").trim(),
    }))
    .filter((row) => row.accountId)
    .filter((row) => row.amountCents >= Math.round(minAmount * 100))
    .filter((row) => row.status === "SUCCEEDED");
}

function neonDonationMatchesCsv(donation: AccountDonation, row: CsvRow) {
  return (
    toCents(donation.amount) === row.amountCents &&
    isSucceededNeonDonation(donation) &&
    donationDateMatchesCsv(donation, row.date) &&
    namesMatch(donation.campaign?.name, row.campaign) &&
    (!donation.fund || namesMatch(donation.fund.name, row.fund))
  );
}

function isSucceededNeonDonation(donation: AccountDonation) {
  if (String(donation.status ?? "").toLowerCase() === "succeeded") return true;
  return donation.payments.some(
    (payment) =>
      String(payment.paymentStatus ?? "").toLowerCase() === "succeeded",
  );
}

function donationDateMatchesCsv(donation: AccountDonation, csvDate: string) {
  const csvIsoDate = parseUsDate(csvDate)?.toISOString().slice(0, 10);
  if (!csvIsoDate) return true;

  if (donation.date.toISOString().slice(0, 10) === csvIsoDate) {
    return true;
  }

  return [
    donation.timestamps.createdDateTime,
    ...donation.payments.map((payment) => payment.receivedDate),
  ]
    .filter((value): value is Date => value instanceof Date)
    .some(
      (value) => formatDateInTimeZone(value, "America/Chicago") === csvIsoDate,
    );
}

function namesMatch(actual: string | null | undefined, expected: string) {
  return (
    expected.trim() === "" || String(actual ?? "").trim() === expected.trim()
  );
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((fields) => fields.some((value) => value !== ""));
}

function rowsToObjects(rows: string[][]) {
  const [header, ...records] = rows;
  if (!header) return [];

  const normalizedHeader = header.map((field, index) =>
    index === 0 ? field.replace(/^\uFEFF/, "") : field,
  );

  return records.map((record) =>
    Object.fromEntries(
      normalizedHeader.map((field, index) => [field, record[index] ?? ""]),
    ),
  );
}

function parseAmountCents(value: string) {
  const numeric = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100);
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function parseUsDate(value: string) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!match) return undefined;

  const [, month, day, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function formatDateInTimeZone(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

async function mapLimit<T>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<void>,
) {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) return;
        await mapper(item);
      }
    },
  );

  await Promise.all(workers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
