/**
 * apps/website/src/utils/discord.ts
 *
 * Sends a Discord notification to staff whenever a wishlist donation comes in.
 * Uses a Discord Incoming Webhook — no bot, no OAuth, just a URL.
 *
 * Setup: Discord server -> channel settings -> Integrations -> Webhooks -> New Webhook
 * Copy the webhook URL into DISCORD_WISHLIST_WEBHOOK_URL in .env
 */

export interface DiscordNotifyOptions {
  itemTitle: string;
  amount: number;
  donorName: string | null;
  donorMessage: string | null;
}

export async function notifyDiscord(opts: DiscordNotifyOptions): Promise<void> {
  const webhookUrl = process.env.DISCORD_WISHLIST_WEBHOOK_URL;
  if (!webhookUrl) return; // Silently skip if not configured — never block a donation on this

  const donor = opts.donorName?.trim() || "Anonymous";

  const embed = {
    title: "🎁 New Wishlist Donation!",
    color: 0x0f6e56, // Alveus green
    fields: [
      { name: "Item", value: opts.itemTitle, inline: false },
      { name: "Amount", value: `$${opts.amount.toFixed(2)}`, inline: true },
      { name: "Donor", value: donor, inline: true },
      ...(opts.donorMessage
        ? [{ name: "💬 Message", value: opts.donorMessage, inline: false }]
        : []),
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Wishlist Bot",
        embeds: [embed],
      }),
    });
  } catch (err) {
    // Never let a Discord failure break the donation flow — just log it.
    console.error("Discord webhook failed:", err);
  }
}

/**
 * Sends a daily/weekly digest of all donations in a given window.
 * Call this from a scheduled cron job (e.g. Vercel Cron or a Netlify scheduled function).
 */
export async function sendDiscordDigest(donations: Array<{
  itemTitle: string;
  amount: number;
  donorName: string | null;
}>): Promise<void> {
  const webhookUrl = process.env.DISCORD_WISHLIST_WEBHOOK_URL;
  if (!webhookUrl || donations.length === 0) return;

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const lines = donations
    .map((d) => `• **$${d.amount.toFixed(2)}** for *${d.itemTitle}* — ${d.donorName?.trim() || "Anonymous"}`)
    .join("\n");

  const embed = {
    title: `📊 Weekly Wishlist Digest — ${donations.length} donation${donations.length === 1 ? "" : "s"}`,
    description: lines,
    color: 0x0f6e56,
    fields: [{ name: "Total raised this week", value: `$${total.toFixed(2)}` }],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Wishlist Bot", embeds: [embed] }),
    });
  } catch (err) {
    console.error("Discord digest webhook failed:", err);
  }
}
