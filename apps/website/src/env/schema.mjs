// @ts-check
import { z } from "zod";
import {
  checkBase64UrlEncoded,
  checkPrivateKey,
  checkPublicKey,
  checkSubject,
} from "./vapid.mjs";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATA_ENCRYPTION_PASSPHRASE: z.string().length(32),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL || str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL_URL ? z.string() : z.string().url()
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
  WEB_PUSH_VAPID_PEM: z.string().optional(),
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
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional(),
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
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV ?? "development",
  // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_NOINDEX: process.env.NEXT_PUBLIC_NOINDEX,
};
