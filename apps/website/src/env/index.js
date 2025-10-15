/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import {
  checkBase64UrlEncoded,
  checkPrivateKey,
  checkPublicKey,
  checkSubject,
} from "./vapid.js";

/**
 * @template {import("zod").ZodTypeAny} T
 * @param {T} schema
 * @returns {import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("zod").infer<T>[]>>}
 */
const listOfSchema = (schema) =>
  z.string().transform((val, ctx) => {
    if (val.trim() === "") {
      return [];
    }

    const items = [];
    for (const item of val.split(" ")) {
      const parsed = schema.safeParse(item.trim());
      if (!parsed.success) {
        parsed.error.issues.forEach(({ ...issue }) => ctx.addIssue(issue));
        return z.NEVER;
      }

      items.push(parsed.data);
    }
    return items;
  });

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    DATA_ENCRYPTION_PASSPHRASE: z.string().length(32),
    NODE_ENV: z
      .literal(["development", "test", "production"])
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
      process.env.VERCEL_URL ? z.string() : z.url(),
    ),
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_EXCLUDED_CLIPS: listOfSchema(z.string()).optional(),
    ACTION_API_SECRET: z.string(),
    CRON_SECRET: z.string().optional(),
    WEATHER_API_KEY: z.string().optional(),
    WEATHER_STATION_ID: z.string().optional(),
    YOUTUBE_API_KEY: z.string().optional(),
    DISABLE_ADMIN_AUTH: z.stringbool().optional().default(false),
    SUPER_USER_IDS: z.string(),
    WEB_PUSH_VAPID_PRIVATE_KEY: z
      .string()
      .check(checkBase64UrlEncoded)
      .check(checkPrivateKey)
      .optional(),
    WEB_PUSH_VAPID_SUBJECT: z.string().check(checkSubject).optional(),
    FILE_STORAGE_CDN_URL: z.string().optional(),
    FILE_STORAGE_ENDPOINT: z.string(),
    FILE_STORAGE_KEY: z.string(),
    FILE_STORAGE_REGION: z.string(),
    FILE_STORAGE_SECRET: z.string(),
    FILE_STORAGE_BUCKET: z.string(),
    FILE_STORAGE_PATH_STYLE: z.stringbool().optional().default(false),
    UPSTASH_QSTASH_URL: z.url().optional(),
    UPSTASH_QSTASH_KEY: z.string().optional(),
    PUSH_LANG: z.string().default("en"),
    PUSH_TEXT_DIR: z.literal(["ltr", "rtl"]).default("ltr"),
    PUSH_BATCH_SIZE: z.coerce.number().int().min(1).default(50),
    PUSH_BATCH_DELAY_MS: z.coerce.number().int().min(1).default(1_000),
    PUSH_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
    PUSH_RETRY_DELAY_MS: z.coerce.number().int().min(1).default(10_000),
    DISCORD_BOT_TOKEN: z.string().optional(),
    DISCORD_CALENDAR_EVENT_GUILD_IDS: listOfSchema(
      z.string().regex(/^[0-9]+$/),
    ).optional(),
    DISCORD_CHANNEL_WEBHOOK_NAME: z.string().default("Alveus Updates"),
    DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION: listOfSchema(
      z.url(),
    ).optional(),
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT: z
      .stringbool()
      .optional()
      .default(false),
    DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT: listOfSchema(z.url()).optional(),
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION: z
      .stringbool()
      .optional()
      .default(false),
    CF_STREAM_KEY_ID: z.string().optional(),
    CF_STREAM_KEY_JWK: z.string().optional(),
    CF_STREAM_LOLA_VIDEO_ID: z.string().optional(),
    CF_STREAM_HOST: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .literal(["development", "test", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_BASE_URL: z.url().refine((url) => !url.endsWith("/")),
    NEXT_PUBLIC_SHORT_BASE_URL: z
      .url()
      .refine((url) => !url.endsWith("/"))
      .optional(),
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: z
      .string()
      .check(checkBase64UrlEncoded)
      .check(checkPublicKey)
      .optional(),
    NEXT_PUBLIC_NOINDEX: z.stringbool().optional(),
    NEXT_PUBLIC_GLOBAL_PROMOTION_TITLE: z.string().optional(),
    NEXT_PUBLIC_GLOBAL_PROMOTION_CTA: z.string().optional(),
    NEXT_PUBLIC_GLOBAL_PROMOTION_LINK: z.string().optional(),
    NEXT_PUBLIC_GLOBAL_PROMOTION_EXTERNAL: z
      .stringbool()
      .optional()
      .default(false),
    NEXT_PUBLIC_GLOBAL_PROMOTION_EXCLUDED: z.string().optional(),
    NEXT_PUBLIC_DONATION_EVENT_TITLE: z.string().optional(),
    NEXT_PUBLIC_DONATION_EVENT_DESCRIPTION: z.string().optional(),
    NEXT_PUBLIC_DONATION_EVENT_CTA: z.string().optional(),
    NEXT_PUBLIC_DONATION_EVENT_LINK: z.string().optional(),
    NEXT_PUBLIC_DONATION_EVENT_EXTERNAL: z
      .stringbool()
      .optional()
      .default(false),
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
    TWITCH_EXCLUDED_CLIPS: process.env.TWITCH_EXCLUDED_CLIPS,
    ACTION_API_SECRET: process.env.ACTION_API_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    WEATHER_STATION_ID: process.env.WEATHER_STATION_ID,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    DISABLE_ADMIN_AUTH: process.env.DISABLE_ADMIN_AUTH,
    SUPER_USER_IDS: process.env.SUPER_USER_IDS,
    WEB_PUSH_VAPID_PRIVATE_KEY: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
    WEB_PUSH_VAPID_SUBJECT: process.env.WEB_PUSH_VAPID_SUBJECT,
    FILE_STORAGE_CDN_URL: process.env.FILE_STORAGE_CDN_URL,
    FILE_STORAGE_ENDPOINT: process.env.FILE_STORAGE_ENDPOINT,
    FILE_STORAGE_KEY: process.env.FILE_STORAGE_KEY,
    FILE_STORAGE_REGION: process.env.FILE_STORAGE_REGION,
    FILE_STORAGE_SECRET: process.env.FILE_STORAGE_SECRET,
    FILE_STORAGE_BUCKET: process.env.FILE_STORAGE_BUCKET,
    FILE_STORAGE_PATH_STYLE: process.env.FILE_STORAGE_PATH_STYLE,
    UPSTASH_QSTASH_URL: process.env.UPSTASH_QSTASH_URL,
    UPSTASH_QSTASH_KEY: process.env.UPSTASH_QSTASH_KEY,
    PUSH_LANG: process.env.PUSH_LANG,
    PUSH_TEXT_DIR: process.env.PUSH_TEXT_DIR,
    PUSH_BATCH_SIZE: process.env.PUSH_BATCH_SIZE,
    PUSH_BATCH_DELAY_MS: process.env.PUSH_BATCH_DELAY_MS,
    PUSH_MAX_ATTEMPTS: process.env.PUSH_MAX_ATTEMPTS,
    PUSH_RETRY_DELAY_MS: process.env.PUSH_RETRY_DELAY_MS,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_CALENDAR_EVENT_GUILD_IDS:
      process.env.DISCORD_CALENDAR_EVENT_GUILD_IDS,
    DISCORD_CHANNEL_WEBHOOK_NAME: process.env.DISCORD_CHANNEL_WEBHOOK_NAME,
    DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION:
      process.env.DISCORD_CHANNEL_WEBHOOK_URLS_STREAM_NOTIFICATION,
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT:
      process.env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_ANNOUNCEMENT,
    DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT:
      process.env.DISCORD_CHANNEL_WEBHOOK_URLS_ANNOUNCEMENT,
    DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION:
      process.env.DISCORD_CHANNEL_WEBHOOK_TO_EVERYONE_STREAM_NOTIFICATION,
    CF_STREAM_KEY_ID: process.env.CF_STREAM_KEY_ID,
    CF_STREAM_KEY_JWK: process.env.CF_STREAM_KEY_JWK,
    CF_STREAM_LOLA_VIDEO_ID: process.env.CF_STREAM_LOLA_VIDEO_ID,
    CF_STREAM_HOST: process.env.CF_STREAM_HOST,
    // Client:
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SHORT_BASE_URL: process.env.NEXT_PUBLIC_SHORT_BASE_URL,
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_NOINDEX: process.env.NEXT_PUBLIC_NOINDEX,
    NEXT_PUBLIC_GLOBAL_PROMOTION_TITLE:
      process.env.NEXT_PUBLIC_GLOBAL_PROMOTION_TITLE,
    NEXT_PUBLIC_GLOBAL_PROMOTION_CTA:
      process.env.NEXT_PUBLIC_GLOBAL_PROMOTION_CTA,
    NEXT_PUBLIC_GLOBAL_PROMOTION_LINK:
      process.env.NEXT_PUBLIC_GLOBAL_PROMOTION_LINK,
    NEXT_PUBLIC_GLOBAL_PROMOTION_EXTERNAL:
      process.env.NEXT_PUBLIC_GLOBAL_PROMOTION_EXTERNAL,
    NEXT_PUBLIC_GLOBAL_PROMOTION_EXCLUDED:
      process.env.NEXT_PUBLIC_GLOBAL_PROMOTION_EXCLUDED,
    NEXT_PUBLIC_DONATION_EVENT_TITLE:
      process.env.NEXT_PUBLIC_DONATION_EVENT_TITLE,
    NEXT_PUBLIC_DONATION_EVENT_DESCRIPTION:
      process.env.NEXT_PUBLIC_DONATION_EVENT_DESCRIPTION,
    NEXT_PUBLIC_DONATION_EVENT_CTA: process.env.NEXT_PUBLIC_DONATION_EVENT_CTA,
    NEXT_PUBLIC_DONATION_EVENT_LINK:
      process.env.NEXT_PUBLIC_DONATION_EVENT_LINK,
    NEXT_PUBLIC_DONATION_EVENT_EXTERNAL:
      process.env.NEXT_PUBLIC_DONATION_EVENT_EXTERNAL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
