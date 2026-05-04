import { z } from "zod";

// Slightly more verbose than the nice typescript-only generic
// but this means it can be validated at runtime

/**
 * Do not use this schema directly. Use the union of the other schemas instead.
 */
const OptionalDonatorSchema = z.object({
  primary: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  displayName: z.string().optional(),
});

const DonatorEmailPrimary = OptionalDonatorSchema.extend({
  primary: z.literal("email"),
  email: z.string(),
});

const DonatorFirstNamePrimary = OptionalDonatorSchema.extend({
  primary: z.literal("firstName"),
  firstName: z.string(),
});
const DonatorLastNamePrimary = OptionalDonatorSchema.extend({
  primary: z.literal("lastName"),
  lastName: z.string(),
});
const DonatorUsernamePrimary = OptionalDonatorSchema.extend({
  primary: z.literal("username"),
  username: z.string(),
});
const DonatorDisplayNamePrimary = OptionalDonatorSchema.extend({
  primary: z.literal("displayName"),
  displayName: z.string(),
});

export const DonatorSchema = z.union([
  DonatorEmailPrimary,
  DonatorFirstNamePrimary,
  DonatorLastNamePrimary,
  DonatorUsernamePrimary,
  DonatorDisplayNamePrimary,
]);
export type Donator = z.infer<typeof DonatorSchema>;

export const Providers = z.literal([
  "twitch",
  "paypal",
  "thegivingblock",
  "neon",
]);
export type Providers = z.infer<typeof Providers>;

export const CoreDonationSchema = z.object({
  id: z.string(),
  provider: Providers,
  providerUniqueId: z.string(),
  amount: z.number(), // USD cents
  donatedAt: z.date().optional(),
  receivedAt: z.date(),
  note: z.string().optional(),
  donatedBy: DonatorSchema,
  tags: z.record(z.string(), z.string()),
});
export type CoreDonation = z.infer<typeof CoreDonationSchema>;

const TwitchDonationMetadataSchema = z.object({
  twitchDonatorId: z.string(),
  twitchDonatorDisplayName: z.string(),
  twitchBroadcasterId: z.string(),
  twitchCharityCampaignId: z.string(),
});

export const TwitchDonationSchema = CoreDonationSchema.extend({
  provider: z.literal("twitch"),
  providerMetadata: TwitchDonationMetadataSchema,
});
export type TwitchDonation = z.infer<typeof TwitchDonationSchema>;

export const TheGivingBlockDonationMetadataSchema = z.object({
  donationMethod: z.literal(["card", "crypto", "stock", "daf"]),
  processorTransactionId: z.string(),
});

export const TheGivingBlockDonationSchema = CoreDonationSchema.extend({
  provider: z.literal("thegivingblock"),
  providerMetadata: TheGivingBlockDonationMetadataSchema,
});
export type TheGivingBlockDonation = z.infer<
  typeof TheGivingBlockDonationSchema
>;

const PaypalDonationMetadataSchema = z.object({
  payerId: z.string(),
});

export const PaypalDonationSchema = CoreDonationSchema.extend({
  provider: z.literal("paypal"),
  providerMetadata: PaypalDonationMetadataSchema,
});
export type PaypalDonation = z.infer<typeof PaypalDonationSchema>;

const NeonDonationMetadataSchema = z.object({
  neonCampaignId: z.string().optional(),
  neonCampaignName: z.string().optional(),
  neonFundId: z.string().optional(),
  neonFundName: z.string().optional(),
  neonAccountId: z.string().optional(),
});

export const NeonDonationSchema = CoreDonationSchema.extend({
  provider: z.literal("neon"),
  providerMetadata: NeonDonationMetadataSchema,
});
export type NeonDonation = z.infer<typeof NeonDonationSchema>;

export const DonationSchema = z.discriminatedUnion("provider", [
  TwitchDonationSchema,
  PaypalDonationSchema,
  TheGivingBlockDonationSchema,
  NeonDonationSchema,
]);

export type Donation = z.infer<typeof DonationSchema>;

export const PixelSchema = z.object({
  id: z.string(),
  muralId: z.string(),
  donationId: z.string(),
  receivedAt: z.date(),
  data: z.string(), // Base64 encoded raw bytes
  identifier: z.string(),
  email: z.string().nullable(),
  column: z.number(),
  row: z.number(),
});
export type Pixel = z.infer<typeof PixelSchema>;

export interface DonationAlert {
  amount: number;
  identifier: string;
  pixels: Pixel[];
}
