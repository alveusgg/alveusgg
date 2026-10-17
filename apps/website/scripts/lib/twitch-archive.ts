import { z } from "zod";

import { fingerprint } from "./backfill";

const Campaign = z.object({ id: z.string().min(1) }).passthrough();
const Donation = z
  .object({
    id: z.string().min(1),
    campaign_id: z.string().min(1),
    user_id: z.string(),
    user_login: z.string(),
    user_name: z.string(),
    amount: z.object({
      value: z.number().int().positive(),
      decimal_places: z.literal(2),
      currency: z.literal("USD"),
    }),
  })
  .passthrough();
const CampaignPage = z.object({ data: z.array(Campaign) });
const DonationPage = z.object({
  data: z.array(Donation),
  pagination: z.object({ cursor: z.string().optional() }),
});

export async function archiveTwitchCampaign(
  broadcasterId: string,
  get: (path: string) => Promise<unknown>,
) {
  const campaignPath = `charity/campaigns?broadcaster_id=${encodeURIComponent(broadcasterId)}`;
  const before = CampaignPage.parse(await get(campaignPath));
  if (before.data.length !== 1) throw new Error("Expected one active campaign");
  const campaign = before.data[0]!;
  const pages: { sha256: string; response: z.output<typeof DonationPage> }[] =
    [];
  const donations: z.output<typeof Donation>[] = [];
  const seenIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: "100",
    });
    if (cursor) params.set("after", cursor);
    const page = DonationPage.parse(await get(`charity/donations?${params}`));
    for (const donation of page.data) {
      if (donation.campaign_id !== campaign.id || seenIds.has(donation.id)) {
        throw new Error("Campaign changed or duplicate donation returned");
      }
      seenIds.add(donation.id);
      donations.push(donation);
    }
    pages.push({ sha256: fingerprint(page), response: page });
    cursor = page.pagination.cursor;
    if (cursor && (seenCursors.has(cursor) || pages.length >= 10000))
      throw new Error("Pagination did not complete");
    if (cursor) seenCursors.add(cursor);
  } while (cursor);
  const after = CampaignPage.parse(await get(campaignPath));
  if (after.data.length !== 1 || after.data[0]?.id !== campaign.id)
    throw new Error("Active campaign changed during export");
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    broadcasterId,
    campaign,
    pages,
    donations,
    donationCount: donations.length,
    amountCents: donations.reduce((n, d) => n + d.amount.value, 0),
    donationsSha256: fingerprint(donations),
    limitations:
      "Active campaign only; not a point-in-time snapshot. Donation timestamps are not supplied by this endpoint.",
  };
}
