import { LinkifyIt } from "linkify-it";

type DiscordTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export const getDiscordTimestamp = (
  date: Date,
  style: DiscordTimestampStyle = "f",
): string => {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${style}>`;
};

export const escapeLinksForDiscord = (text: string) => {
  const linkify = new LinkifyIt({
    fuzzyLink: false,
    fuzzyEmail: false,
    fuzzyIP: false,
  });

  const matches = linkify.match(text);

  let offset = 0;
  if (matches != null) {
    for (const match of matches) {
      const linkStart = match.index + offset;
      const linkEnd = match.lastIndex + offset;

      const linkified = `<${match.text}>`;
      text = text.slice(0, linkStart) + linkified + text.slice(linkEnd);

      offset += linkified.length - (match.lastIndex - match.index);
    }
  }

  return text;
};

// Wishlist alerts post to their own Discord incoming webhook, created under
// channel settings -> Integrations -> Webhooks

export interface DiscordNotifyOptions {
  webhookUrl: string | undefined;
  itemTitle: string;
  amount: number;
  donorName: string | null;
  donorMessage: string | null;
}

export async function notifyWishlistDonation(
  opts: DiscordNotifyOptions,
): Promise<void> {
  const { webhookUrl } = opts;
  if (!webhookUrl) return; // Optional, never blocks a donation

  const donor = opts.donorName?.trim() || "Anonymous";
  const message = opts.donorMessage
    ? escapeLinksForDiscord(opts.donorMessage)
    : null;

  const embed = {
    title: "New Wishlist Donation!",
    color: 0x0f6e56,
    fields: [
      { name: "Item", value: opts.itemTitle, inline: false },
      { name: "Amount", value: `$${opts.amount.toFixed(2)}`, inline: true },
      { name: "Donor", value: donor, inline: true },
      ...(message ? [{ name: "Message", value: message, inline: false }] : []),
    ],
    // Embeds need an ISO 8601 timestamp, not the <t:...> chat format
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
    // fetch only rejects on network errors, so a rejected payload or rate
    // limit has to be caught from the status
    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }
  } catch (err) {
    // Never let a Discord failure break the donation flow, just log it.
    console.error("Discord wishlist webhook failed:", err);
  }
}

/**
 * Tells staff a crowdfunded item reached its target and can be bought.
 */
export async function notifyWishlistItemFunded({
  webhookUrl,
  itemTitle,
}: {
  webhookUrl: string | undefined;
  itemTitle: string;
}): Promise<void> {
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Wishlist Bot",
        content: `${escapeLinksForDiscord(itemTitle)} is fully funded, time to buy it`,
        allowed_mentions: { parse: [] },
      }),
    });
    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }
  } catch (err) {
    console.error("Discord wishlist funded webhook failed:", err);
  }
}

const paymentIssueLabels = {
  DENIED: "denied",
  REFUNDED: "refunded",
  REVERSED: "reversed",
} as const;

/**
 * Tells staff a wishlist payment was denied, refunded or reversed. The item
 * total is not changed automatically, so staff adjust it if needed.
 */
export async function notifyWishlistPaymentIssue(opts: {
  webhookUrl: string | undefined;
  itemTitle: string;
  status: keyof typeof paymentIssueLabels;
  amount: number;
  donorName: string | null;
  wasCredited: boolean;
  paypalOrderId: string;
  captureId: string;
}): Promise<void> {
  if (!opts.webhookUrl) return;

  const embed = {
    title: `Wishlist payment ${paymentIssueLabels[opts.status]}`,
    description: opts.wasCredited
      ? "This donation was credited to the item. Check whether its total needs adjusting."
      : "This donation was never credited to the item.",
    color: 0xb91c1c,
    fields: [
      { name: "Item", value: opts.itemTitle, inline: false },
      { name: "Amount", value: `$${opts.amount.toFixed(2)}`, inline: true },
      {
        name: "Donor",
        value: opts.donorName?.trim() || "Anonymous",
        inline: true,
      },
      { name: "PayPal order", value: opts.paypalOrderId, inline: false },
      { name: "PayPal capture", value: opts.captureId, inline: false },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(opts.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }
  } catch (err) {
    console.error("Discord wishlist payment issue webhook failed:", err);
  }
}

/**
 * Sends a digest of recent wishlist donations. Call from a scheduled job.
 */
export async function sendWishlistDigest(
  webhookUrl: string | undefined,
  donations: Array<{
    itemTitle: string;
    amount: number;
    donorName: string | null;
  }>,
): Promise<void> {
  if (!webhookUrl || donations.length === 0) return;

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const lines = donations
    .map(
      (d) =>
        `- **$${d.amount.toFixed(2)}** for *${escapeLinksForDiscord(d.itemTitle)}* by ${d.donorName?.trim() || "Anonymous"}`,
    )
    .join("\n");

  const embed = {
    title: `Weekly Wishlist Digest: ${donations.length} donation${donations.length === 1 ? "" : "s"}`,
    description: lines,
    color: 0x0f6e56,
    fields: [{ name: "Total raised this week", value: `$${total.toFixed(2)}` }],
    // Embeds need an ISO 8601 timestamp, not the <t:...> chat format
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }
  } catch (err) {
    console.error("Discord wishlist digest webhook failed:", err);
  }
}
