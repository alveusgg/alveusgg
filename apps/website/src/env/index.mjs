// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import {
  checkBase64UrlEncoded,
  checkPrivateKey,
  checkPublicKey,
  checkSubject,
} from "./vapid.mjs";

const listOfUrlsSchema = z
  .string()
  .transform((val) =>
    val.split(" ").map((url) => z.string().url().parse(url.trim()).toString()),
  );

const optionalBoolSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => val === "true");

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATA_ENCRYPTION_PASSPHRASE: z.string().length(32),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL || str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL_URL ? z.string() : z.string().url(),
    ),
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_EVENTSUB_SECRET: z.string(),
    TWITCH_EVENTSUB_CALLBACK: z.string(),
    ACTION_API_SECRET: z.string(),
    SUPER_USER_IDS: z.string(),
    WEB_PUSH_VAPID_PRIVATE_KEY: z
      .string()
      .superRefine(checkBase64UrlEncoded)
      .superRefine(checkPrivateKey)
      .optional(),
    WEB_PUSH_VAPID_SUBJECT: z.string().superRefine(checkSubject).optional(),
    OPEN_WEATHER_MAP_API_KEY: z.string().optional(),
    OPEN_WEATHER_MAP_API_LAT: z.string().optional(),
    OPEN_WEATHER_MAP_API_LON: z.string().optional(),
    FILE_STORAGE_CDN_URL: z.string().optional(),
    FILE_STORAGE_ENDPOINT: z.string(),
    FILE_STORAGE_KEY: z.string(),
    FILE_STORAGE_REGION: z.string(),
    FILE_STORAGE_SECRET: z.string(),
    FILE_STORAGE_BUCKET: z.string(),
    UPSTASH_QSTASH_URL: z.string().url().optional(),
    UPSTASH_QSTASH_KEY: z.string().optional(),
    PUSH_LANG: z.string().optional(),
    PUSH_TEXT_DIR: z.enum(["ltr", "rtl"]).optional(),
    PUSH_BATCH_SIZE: z.number().int().min(1).optional(),
    PUSH_MAX_ATTEMPTS: z.number().int().min(1).optional(),
    PUSH_RETRY_DELAY_MS: z.number().int().min(1).optional(),
    DISCORD_BOT_NAME: z.string().default("Alveus Updates"),
    DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION:
      listOfUrlsSchema.optional(),
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT: optionalBoolSchema,
    DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT: listOfUrlsSchema.optional(),
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION: optionalBoolSchema,
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "test", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .url()
      .refine((url) => !url.endsWith("/")),
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: z
      .string()
      .superRefine(checkBase64UrlEncoded)
      .superRefine(checkPublicKey)
      .optional(),
    NEXT_PUBLIC_NOINDEX: z.string().optional(),
    NEXT_PUBLIC_FEATURE_NOTIFICATIONS_ADVANCED: optionalBoolSchema,
  },
  /**
   * You can't destruct `process.env` as a regular object, so you have to do
   * it manually here. This is because Next.js evaluates this at build time,
   * and only used environment variables are included in the build.
   */
  runtimeEnv: {
    // Server:
    DATABASE_URL: process.env.DATABASE_URL,
    DATA_ENCRYPTION_PASSPHRASE: process.env.DATA_ENCRYPTION_PASSPHRASE,
    NODE_ENV: process.env.NODE_ENV || "production",
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? process.env.NEXTAUTH_SECRET
        : undefined,
    NEXTAUTH_URL: process.env.VERCEL_URL || process.env.NEXTAUTH_URL,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITCH_EVENTSUB_SECRET: process.env.TWITCH_EVENTSUB_SECRET,
    TWITCH_EVENTSUB_CALLBACK: process.env.TWITCH_EVENTSUB_CALLBACK,
    ACTION_API_SECRET: process.env.ACTION_API_SECRET,
    SUPER_USER_IDS: process.env.SUPER_USER_IDS,
    WEB_PUSH_VAPID_PRIVATE_KEY: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
    WEB_PUSH_VAPID_SUBJECT: process.env.WEB_PUSH_VAPID_SUBJECT,
    OPEN_WEATHER_MAP_API_KEY: process.env.OPEN_WEATHER_MAP_API_KEY,
    OPEN_WEATHER_MAP_API_LAT: process.env.OPEN_WEATHER_MAP_API_LAT,
    OPEN_WEATHER_MAP_API_LON: process.env.OPEN_WEATHER_MAP_API_LON,
    FILE_STORAGE_CDN_URL: process.env.FILE_STORAGE_CDN_URL,
    FILE_STORAGE_ENDPOINT: process.env.FILE_STORAGE_ENDPOINT,
    FILE_STORAGE_KEY: process.env.FILE_STORAGE_KEY,
    FILE_STORAGE_REGION: process.env.FILE_STORAGE_REGION,
    FILE_STORAGE_SECRET: process.env.FILE_STORAGE_SECRET,
    FILE_STORAGE_BUCKET: process.env.FILE_STORAGE_BUCKET,
    UPSTASH_QSTASH_URL: process.env.UPSTASH_QSTASH_URL,
    UPSTASH_QSTASH_KEY: process.env.UPSTASH_QSTASH_KEY,
    PUSH_LANG: process.env.PUSH_LANG,
    PUSH_TEXT_DIR: process.env.PUSH_TEXT_DIR,
    PUSH_BATCH_SIZE: process.env.PUSH_BATCH_SIZE,
    PUSH_MAX_ATTEMPTS: process.env.PUSH_MAX_ATTEMPTS,
    PUSH_RETRY_DELAY_MS: process.env.PUSH_RETRY_DELAY_MS,
    DISCORD_BOT_NAME: process.env.DISCORD_BOT_NAME,
    DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION:
      process.env.DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION,
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT:
      process.env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT,
    DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT:
      process.env.DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT,
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION:
      process.env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION,
    // Client:
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_NOINDEX: process.env.NEXT_PUBLIC_NOINDEX,
    NEXT_PUBLIC_FEATURE_NOTIFICATIONS_ADVANCED:
      process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS_ADVANCED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
