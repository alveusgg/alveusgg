// // @ts-check
// /**
//  * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
//  * It has to be a `.mjs`-file to be imported there.
//  */
// import { formatErrors } from "./formatErrors.mjs";
// import { clientEnv, clientSchema } from "./schema.mjs";

// const _clientEnv = clientSchema.safeParse(clientEnv);

// if (!_clientEnv.success) {
//   console.error(
//     "❌ Invalid environment variables:\n",
//     ...formatErrors(_clientEnv.error.format())
//   );
//   throw new Error("Invalid environment variables");
// }

// for (let key of Object.keys(_clientEnv.data)) {
//   if (!key.startsWith("NEXT_PUBLIC_")) {
//     console.warn(
//       `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`
//     );

//     throw new Error("Invalid public environment variable name");
//   }
// }

// export const env = _clientEnv.data;

// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
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
