// // @ts-check
// /**
//  * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
//  * It has to be a `.mjs`-file to be imported there.
//  */
// import { formatErrors } from "./formatErrors.mjs";
// import { serverSchema } from "./schema.mjs";
// import { env as clientEnv } from "./client.mjs";

// const _serverEnv = serverSchema.safeParse({
//   ...process.env,
// });

// if (!_serverEnv.success) {
//   console.error(
//     "❌ Invalid environment variables:\n",
//     ...formatErrors(_serverEnv.error.format())
//   );
//   throw new Error("Invalid environment variables");
// }

// for (let key of Object.keys(_serverEnv.data)) {
//   if (key.startsWith("NEXT_PUBLIC_")) {
//     console.warn("❌ You are exposing a server-side env-variable:", key);

//     throw new Error("You are exposing a server-side env-variable");
//   }
// }

// export const env = { ..._serverEnv.data, ...clientEnv };

// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
      process.env.VERCEL_URL ? z.string() : z.string().url()
    ),
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_EVENTSUB_SECRET: z.string(),
    TWITCH_EVENTSUB_CALLBACK: z.string(),
    ACTION_API_SECRET: z.string(),
    SUPER_USER_IDS: z.string(),
    WEB_PUSH_VAPID_PRIVATE_KEY: z.string().regex(/^[A-Za-z0-9\-_]+$/),
    WEB_PUSH_VAPID_SUBJECT: z.string(),
    OPEN_WEATHER_MAP_API_KEY: z.string().optional(),
    OPEN_WEATHER_MAP_API_LAT: z.string().optional(),
    OPEN_WEATHER_MAP_API_LON: z.string().optional(),
    FILE_STORAGE_CDN_URL: z.string().optional(),
    FILE_STORAGE_ENDPOINT: z.string(),
    FILE_STORAGE_KEY: z.string(),
    FILE_STORAGE_REGION: z.string(),
    FILE_STORAGE_SECRET: z.string(),
    FILE_STORAGE_BUCKET: z.string(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "test", "production"])
      .optional(),
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .url()
      .refine((url) => !url.endsWith("/")),
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: z
      .string()
      .regex(/^[A-Za-z0-9\-_]+$/),
    NEXT_PUBLIC_NOINDEX: z.string().optional(),
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
    // Client:
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV ?? "development",
    // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_NOINDEX: process.env.NEXT_PUBLIC_NOINDEX,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
