import { randomBytes } from "node:crypto";

import { z } from "zod";

import { env } from "@/env";

import {
  createSaltedEncryptionKey,
  decrypt,
  encrypt,
} from "@/server/utils/encryption";
import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";

// A Neon donor session only proves which Neon account logged in, it is not tied
// to a website user. Both cookies are encrypted with the data encryption key, so
// the account ID can neither be read nor forged on the client.

const SESSION_MAX_AGE_SECONDS = 60 * 60;
// Neon only issues the (10 minute) authorization code once the donor has logged
// in, so leave enough time to create a login or reset the password there first.
const STATE_MAX_AGE_SECONDS = 60 * 60;

const isSecure = env.NEXT_PUBLIC_BASE_URL.startsWith("https://");
const cookiePrefix = isSecure ? "__Host-" : "";

export const NEON_DONOR_SESSION_COOKIE = `${cookiePrefix}alveus.neon-donor`;
export const NEON_OAUTH_STATE_COOKIE = `${cookiePrefix}alveus.neon-oauth-state`;

export const DEFAULT_NEON_RETURN_TO = "/institute/pixels";

export function getNeonCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isSecure,
    // Lax so the cookies are sent on the top-level redirect back from Neon
    sameSite: "lax",
    path: "/",
    maxAge,
  } as const;
}

const sessionSchema = z.object({
  purpose: z.literal("neon-donor-session"),
  accountId: z.string(),
  exp: z.number(),
});

const stateSchema = z.object({
  purpose: z.literal("neon-oauth-state"),
  state: z.string(),
  returnTo: z.string(),
  exp: z.number(),
});

let encryptionKey: Promise<CryptoKey> | undefined;
function getEncryptionKey() {
  encryptionKey ??= createSaltedEncryptionKey(
    new TextEncoder().encode("neon-donor-session"),
  );
  return encryptionKey;
}

async function seal(payload: object) {
  return encrypt(JSON.stringify(payload), await getEncryptionKey());
}

async function unseal<T extends { exp: number }>(
  value: string | undefined,
  schema: z.ZodType<T>,
) {
  if (!value) return null;

  try {
    const decrypted = await decrypt(value, await getEncryptionKey(), {
      allowEmpty: false,
    });
    const parsed = schema.safeParse(JSON.parse(decrypted));
    if (!parsed.success || parsed.data.exp < Date.now() / 1000) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function getExpiry(maxAge: number) {
  return Math.floor(Date.now() / 1000) + maxAge;
}

/**
 * Only allow returning to paths on this site, to not become an open redirect.
 */
export function getSafeNeonReturnTo(returnTo: string | null | undefined) {
  if (!returnTo) return DEFAULT_NEON_RETURN_TO;

  try {
    const base = new URL(env.NEXT_PUBLIC_BASE_URL);
    const url = new URL(returnTo, base);
    // "//host" paths would turn into protocol-relative URLs
    if (url.origin !== base.origin || url.pathname.startsWith("//")) {
      return DEFAULT_NEON_RETURN_TO;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return DEFAULT_NEON_RETURN_TO;
  }
}

export async function createNeonOAuthState(returnTo: string) {
  const state = randomBytes(32).toString("base64url");
  const cookie = await seal({
    purpose: "neon-oauth-state",
    state,
    returnTo,
    exp: getExpiry(STATE_MAX_AGE_SECONDS),
  } satisfies z.infer<typeof stateSchema>);

  return { state, cookie, maxAge: STATE_MAX_AGE_SECONDS };
}

/**
 * Returns where to send the user after the login, or null if the state does
 * not match the one that was set when the login started.
 */
export async function verifyNeonOAuthState(
  cookie: string | undefined,
  state: string | null,
) {
  const data = await unseal(cookie, stateSchema);
  if (!data || !state || !timingSafeCompareString(data.state, state)) {
    return null;
  }

  return data.returnTo;
}

export async function createNeonDonorSession(accountId: string) {
  const cookie = await seal({
    purpose: "neon-donor-session",
    accountId,
    exp: getExpiry(SESSION_MAX_AGE_SECONDS),
  } satisfies z.infer<typeof sessionSchema>);

  return { cookie, maxAge: SESSION_MAX_AGE_SECONDS };
}

export async function getNeonDonorSession(cookie: string | undefined) {
  const data = await unseal(cookie, sessionSchema);
  return data && { accountId: data.accountId };
}
