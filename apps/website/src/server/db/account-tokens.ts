import type { PrismaAdapter } from "@auth/prisma-adapter";

import { fieldEncryption } from "@/server/utils/field-encryption";

type Tokens = {
  access_token?: string | null;
  refresh_token?: string | null;
};

const accountContext = (field: "access_token" | "refresh_token") => ({
  model: "Account",
  field,
});

const clientAccessTokenContext = (field: "access_token" | "refresh_token") => ({
  model: "ClientAccessToken",
  field,
});

type Context = typeof accountContext;

async function transform<T extends Tokens>(
  value: T,
  context: Context,
  fn: (
    token: string | null | undefined,
    context: ReturnType<Context>,
  ) => Promise<string | null | undefined>,
): Promise<T> {
  const result = { ...value };
  // Only touch the fields that are present, so partial updates stay partial
  if (value.access_token !== undefined) {
    result.access_token = await fn(value.access_token, context("access_token"));
  }
  if (value.refresh_token !== undefined) {
    result.refresh_token = await fn(
      value.refresh_token,
      context("refresh_token"),
    );
  }
  return result;
}

const encrypt = (token: string | null | undefined, ctx: ReturnType<Context>) =>
  fieldEncryption.encryptOptional(token, ctx);

const decrypt = (token: string | null | undefined, ctx: ReturnType<Context>) =>
  // TODO(201-cleanup): remove allowPlaintext once the OAuth token backfill has been run in production
  fieldEncryption.decryptOptional(token, ctx, { allowPlaintext: true });

/** Encrypt the OAuth tokens of an `Account` (data to write) */
export const encryptAccountTokens = <T extends Tokens>(tokens: T) =>
  transform(tokens, accountContext, encrypt);

/** Decrypt the OAuth tokens of an `Account` row (also accepts rows not backfilled yet) */
export const decryptAccountTokens = <T extends Tokens>(account: T) =>
  transform(account, accountContext, decrypt);

/** Encrypt the tokens of a `ClientAccessToken` (data to write) */
export const encryptClientAccessTokens = <T extends Tokens>(tokens: T) =>
  transform(tokens, clientAccessTokenContext, encrypt);

/** Decrypt the tokens of a `ClientAccessToken` row (also accepts rows not backfilled yet) */
export const decryptClientAccessTokens = <T extends Tokens>(token: T) =>
  transform(token, clientAccessTokenContext, decrypt);

/** Encrypt a token that is still plaintext (or uses another key), `undefined` if it's up to date */
async function backfillToken(
  token: string | null,
  context: ReturnType<Context>,
) {
  if (!token || !fieldEncryption.needsReencryption(token)) return undefined;
  const plaintext = await decrypt(token, context);
  return fieldEncryption.encrypt(plaintext!, context);
}

/**
 * The update needed to migrate an `Account` row (for the backfill), or `null` if it's done.
 * `id_token` is never stored anymore, so any value there has to be cleared too.
 */
export async function getAccountBackfill(account: {
  access_token: string | null;
  refresh_token: string | null;
  id_token: string | null;
}) {
  const [access_token, refresh_token] = await Promise.all([
    backfillToken(account.access_token, accountContext("access_token")),
    backfillToken(account.refresh_token, accountContext("refresh_token")),
  ]);
  const clearIdToken = account.id_token !== null;
  if (
    access_token === undefined &&
    refresh_token === undefined &&
    !clearIdToken
  )
    return null;

  return {
    ...(access_token !== undefined && { access_token }),
    ...(refresh_token !== undefined && { refresh_token }),
    ...(clearIdToken && { id_token: null }),
  };
}

/** The update needed to migrate a `ClientAccessToken` row (for the backfill), or `null` if it's done */
export async function getClientAccessTokenBackfill(token: {
  access_token: string;
  refresh_token: string | null;
}) {
  const [access_token, refresh_token] = await Promise.all([
    backfillToken(token.access_token, clientAccessTokenContext("access_token")),
    backfillToken(
      token.refresh_token,
      clientAccessTokenContext("refresh_token"),
    ),
  ]);
  if (access_token === undefined && refresh_token === undefined) return null;

  return {
    ...(access_token !== undefined && { access_token }),
    ...(refresh_token !== undefined && { refresh_token }),
  };
}

/**
 * Wrap the NextAuth adapter so new accounts get their tokens encrypted. The `id_token` is an
 * OIDC JWT that contains the user's email, nothing reads it after sign-in, so it isn't stored.
 */
export const withEncryptedAccountTokens = (
  adapter: ReturnType<typeof PrismaAdapter>,
): ReturnType<typeof PrismaAdapter> => ({
  ...adapter,
  linkAccount: async (account) => {
    if (!adapter.linkAccount) {
      throw new Error("The adapter can't link accounts");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id_token, ...rest } = account;
    // NextAuth ignores the result
    await adapter.linkAccount(await encryptAccountTokens(rest));
  },
});
