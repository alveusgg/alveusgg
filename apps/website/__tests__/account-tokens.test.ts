import { describe, expect, test, vi } from "vitest";

import { isEncrypted } from "@alveusgg/database/encryption";

import {
  decryptAccountTokens,
  decryptClientAccessTokens,
  encryptAccountTokens,
  encryptClientAccessTokens,
  getAccountBackfill,
  getClientAccessTokenBackfill,
  withEncryptedAccountTokens,
} from "@/server/db/account-tokens";
import { fieldEncryption } from "@/server/utils/field-encryption";

vi.mock("@/env", () => {
  return {
    env: {
      DATA_ENCRYPTION_KEYS: "k1:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      DATA_BLIND_INDEX_KEY: "YmxpbmQtaW5kZXgta2V5LWZvci10ZXN0cy0xMjM0NTY=",
      DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
    },
  };
});

// Twitch tokens are 30 random alphanumeric characters
const accessToken = "abcdefghijklmnopqrstuvwxyz0123";
const refreshToken = "zyxwvutsrqponmlkjihgfedcba9876";

describe("account tokens", () => {
  test("round trip", async () => {
    const encrypted = await encryptAccountTokens({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    expect(isEncrypted(encrypted.access_token!)).toBe(true);
    expect(isEncrypted(encrypted.refresh_token!)).toBe(true);
    expect(await decryptAccountTokens(encrypted)).toEqual({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  });

  test("keeps other fields, null and missing tokens as they are", async () => {
    expect(
      await encryptAccountTokens({ access_token: null, expires_at: 1 }),
    ).toEqual({ access_token: null, expires_at: 1 });
    expect(
      await decryptAccountTokens({ id: "a", refresh_token: undefined }),
    ).toEqual({ id: "a" });
  });

  test("reads plaintext tokens that haven't been backfilled", async () => {
    expect(
      await decryptAccountTokens({
        access_token: accessToken,
        refresh_token: null,
      }),
    ).toEqual({ access_token: accessToken, refresh_token: null });
  });

  test("tokens are bound to their model and field", async () => {
    const { access_token } = await encryptAccountTokens({
      access_token: accessToken,
    });
    await expect(
      decryptAccountTokens({ refresh_token: access_token }),
    ).rejects.toThrow();
    await expect(decryptClientAccessTokens({ access_token })).rejects.toThrow();
  });

  test("client access tokens round trip", async () => {
    const encrypted = await encryptClientAccessTokens({
      access_token: accessToken,
    });
    expect(isEncrypted(encrypted.access_token)).toBe(true);
    expect(await decryptClientAccessTokens(encrypted)).toEqual({
      access_token: accessToken,
    });
    expect(
      await decryptClientAccessTokens({ access_token: accessToken }),
    ).toEqual({ access_token: accessToken });
  });

  test("encrypted tokens fit in the VARCHAR(191) of ClientAccessToken", async () => {
    // Longest possible key id is 16 characters, so check against a longer token than Twitch's
    const { access_token } = await encryptClientAccessTokens({
      access_token: "a".repeat(60),
    });
    expect(access_token.length).toBeLessThanOrEqual(191);
  });
});

describe("withEncryptedAccountTokens", () => {
  test("linkAccount stores encrypted tokens and no id_token", async () => {
    const linkAccount = vi.fn().mockResolvedValue(undefined);
    const getUser = vi.fn();
    const adapter = withEncryptedAccountTokens({
      linkAccount,
      getUser,
    } as unknown as Parameters<typeof withEncryptedAccountTokens>[0]);

    await adapter.linkAccount!({
      userId: "user",
      type: "oauth",
      provider: "twitch",
      providerAccountId: "123",
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: "header.payload.signature",
      expires_at: 1234,
      scope: "user:read:email",
      token_type: "bearer",
    });

    expect(linkAccount).toHaveBeenCalledTimes(1);
    const data = linkAccount.mock.calls[0]![0];
    expect(data).not.toHaveProperty("id_token");
    expect(data).toMatchObject({
      userId: "user",
      provider: "twitch",
      providerAccountId: "123",
      expires_at: 1234,
      scope: "user:read:email",
      token_type: "bearer",
    });
    expect(isEncrypted(data.access_token)).toBe(true);
    expect(isEncrypted(data.refresh_token)).toBe(true);
    expect(JSON.stringify(data)).not.toContain(accessToken);
    expect(JSON.stringify(data)).not.toContain(refreshToken);
    expect(
      await fieldEncryption.decrypt(data.access_token, {
        model: "Account",
        field: "access_token",
      }),
    ).toBe(accessToken);

    // Other methods are passed through
    expect(adapter.getUser).toBe(getUser);
  });
});

describe("backfill", () => {
  test("encrypts plaintext tokens and clears the id_token", async () => {
    const data = await getAccountBackfill({
      access_token: accessToken,
      refresh_token: null,
      id_token: "header.payload.signature",
    });
    expect(data).not.toBeNull();
    expect(data!.id_token).toBeNull();
    expect(data).not.toHaveProperty("refresh_token");
    expect(isEncrypted(data!.access_token!)).toBe(true);
  });

  test("is idempotent", async () => {
    const encrypted = await encryptAccountTokens({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    expect(
      await getAccountBackfill({ ...encrypted, id_token: null } as {
        access_token: string;
        refresh_token: string;
        id_token: null;
      }),
    ).toBeNull();
    expect(
      await getAccountBackfill({
        access_token: null,
        refresh_token: null,
        id_token: null,
      }),
    ).toBeNull();
  });

  test("client access tokens", async () => {
    const data = await getClientAccessTokenBackfill({
      access_token: accessToken,
      refresh_token: null,
    });
    expect(isEncrypted(data!.access_token!)).toBe(true);
    expect(
      await getClientAccessTokenBackfill({
        access_token: data!.access_token!,
        refresh_token: null,
      }),
    ).toBeNull();
  });
});
