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

// ─── Wishlist donation notifications ───────────────────────────────────────────
// Uses a separate Discord Incoming Webhook (DISCORD_WISHLIST_WEBHOOK_URL) —
// no bot, no OAuth, just a URL. Setup: Discord server -> channel settings ->
// Integrations -> Webhooks -> New Webhook.

export interface DiscordNotifyOptions {
  itemTitle: string;
  amount: number;
  donorName: string | null;
  donorMessage: string | null;
}

export async function notifyWishlistDonation(
  opts: DiscordNotifyOptions,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WISHLIST_WEBHOOK_URL;
  if (!webhookUrl) return; // Silently skip if not configured — never block a donation on this

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
    timestamp: getDiscordTimestamp(new Date(), "F"),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
  } catch (err) {
    // Never let a Discord failure break the donation flow — just log it.
    console.error("Discord wishlist webhook failed:", err);
  }
}

/**
 * Sends a digest of recent wishlist donations. Call from a scheduled job.
 */
export async function sendWishlistDigest(
  donations: Array<{ itemTitle: string; amount: number; donorName: string | null }>,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WISHLIST_WEBHOOK_URL;
  if (!webhookUrl || donations.length === 0) return;

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const lines = donations
    .map(
      (d) =>
        `- **$${d.amount.toFixed(2)}** for *${escapeLinksForDiscord(d.itemTitle)}* — ${d.donorName?.trim() || "Anonymous"}`,
    )
    .join("\n");

  const embed = {
    title: `Weekly Wishlist Digest — ${donations.length} donation${donations.length === 1 ? "" : "s"}`,
    description: lines,
    color: 0x0f6e56,
    fields: [{ name: "Total raised this week", value: `$${total.toFixed(2)}` }],
    timestamp: getDiscordTimestamp(new Date(), "F"),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
  } catch (err) {
    console.error("Discord wishlist digest webhook failed:", err);
  }
}
