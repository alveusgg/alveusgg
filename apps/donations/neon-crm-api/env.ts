import { z } from "zod";

export const serverEnv = {
  NEON_CRM_BASE_URL: z.httpUrl().refine((url) => url.endsWith("/"), {
    error:
      "NEON_CRM_BASE_URL must be a valid http(s) URL with a trailing slash",
  }),
  NEON_CRM_ORG_ID: z.string(),
  NEON_CRM_API_KEY: z.string(),
  NEON_CRM_WEBHOOK_USERNAME: z.string().optional(),
  NEON_CRM_WEBHOOK_PASSWORD: z.string().optional(),
  NEON_CRM_LOCAL_TIMEZONE: z.string().default("America/Chicago"),
} as const;

export type Env = z.output<typeof _EnvSchema>;
const _EnvSchema = z.object(serverEnv);

export type Options = ReturnType<typeof envToOptions>;

export const envToOptions = (env: Env) =>
  ({
    baseUrl: env.NEON_CRM_BASE_URL,
    apiKey: env.NEON_CRM_API_KEY,
    organizationId: env.NEON_CRM_ORG_ID,
    basicAuthUsername: env.NEON_CRM_WEBHOOK_USERNAME,
    basicAuthPassword: env.NEON_CRM_WEBHOOK_PASSWORD,
    localTimezone: env.NEON_CRM_LOCAL_TIMEZONE,
  }) as const;

export const buildBasicAuth = (
  options: Pick<Options, "basicAuthUsername" | "basicAuthPassword">,
) =>
  ({
    userName: options.basicAuthUsername ?? "",
    password: options.basicAuthPassword ?? "",
  }) as const;
