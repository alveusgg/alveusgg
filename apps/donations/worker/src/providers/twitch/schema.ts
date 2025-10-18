import { z } from "zod";

export const TwitchChallengePayload = z.object({
  challenge: z.string(),
});
export const TwitchSubscriptionPayload = z.object({
  id: z.string(),
  type: z
    .literal("channel.charity_campaign.donate")
    .describe("Only channel.charity_campaign.donate events are supported."),
  version: z.string(),
  status: z.string(),
  condition: z.object({
    broadcaster_user_id: z.string(),
  }),
  transport: z.object({
    method: z.string(),
    callback: z.string(),
  }),
});

export const TwitchAmountPayload = z.object({
  value: z.number().describe("The amount of the donation in USD cents."),
  decimal_places: z
    .literal(2)
    .describe("As this is a USD donation, the decimal places are always 2."),
  currency: z
    .literal("USD")
    .describe(
      "While Twitch has this as a field, it is currently not possible to donate in any other currency on a Twitch charity campaign.",
    ),
});

export const TwitchEventPayload = z.object({
  id: z.string(),
  campaign_id: z.string(),
  broadcaster_user_id: z.string(),
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
  charity_name: z.string(),
  amount: TwitchAmountPayload,
});

export const TwitchNotificationPayload = z.object({
  subscription: TwitchSubscriptionPayload,
  event: TwitchEventPayload,
});
