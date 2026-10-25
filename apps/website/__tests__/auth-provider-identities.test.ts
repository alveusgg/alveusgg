import type { PrismaAdapter } from "@auth/prisma-adapter";
import type { Session } from "next-auth";
import { beforeEach, expect, test, vi } from "vitest";

import { withLoginOnlyAccounts } from "@/server/auth/accounts";
import {
  getProviderAccountProfile,
  getVerifiedProviderEmail,
} from "@/server/auth/profiles";
import { getMyPixels } from "@/server/db/donations";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const { updateUser, updateAccount, pixels, twitchId } = vi.hoisted(() => ({
  updateUser: vi.fn(),
  updateAccount: vi.fn(),
  pixels: vi.fn(),
  twitchId: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({
  prisma: {
    user: { update: updateUser },
    account: { update: updateAccount },
    pixel: { findMany: pixels },
  },
}));
vi.mock("@/server/db/users", () => ({
  getTwitchUserId: twitchId,
  getRolesForUser: vi.fn(),
}));
vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://alveus.example",
    TWITCH_CLIENT_ID: "twitch-client",
    TWITCH_CLIENT_SECRET: "secret",
    GOOGLE_CLIENT_ID: "google-client",
    GOOGLE_CLIENT_SECRET: "secret",
    DISCORD_CLIENT_ID: "discord-client",
    DISCORD_CLIENT_SECRET: "secret",
  },
}));
beforeEach(() => {
  vi.resetAllMocks();
  twitchId.mockResolvedValue(undefined);
  pixels.mockResolvedValue([]);
});

test.each(["twitch", "google", "discord"])(
  "only accepts verified email ownership from %s",
  (provider) => {
    const verified =
      provider === "discord" ? { verified: true } : { email_verified: true };
    expect(
      getVerifiedProviderEmail(provider, {
        email: " Member@Example.com ",
        ...verified,
      }),
    ).toBe("member@example.com");
    expect(
      getVerifiedProviderEmail(provider, { email: "member@example.com" }),
    ).toBeNull();
    expect(
      getVerifiedProviderEmail(provider, {
        email: "member@example.com",
        verified: "true",
        email_verified: "true",
      }),
    ).toBeNull();
    expect(
      getVerifiedProviderEmail(provider, { ...verified, email: null }),
    ).toBeNull();
  },
);

test.each(["google", "discord"])(
  "discards %s API tokens while retaining its stable identity",
  async (provider) => {
    const linkAccount = vi.fn();
    const adapter = withLoginOnlyAccounts({ linkAccount } as ReturnType<
      typeof PrismaAdapter
    >);
    await adapter.linkAccount!({
      userId: "user",
      type: "oauth",
      provider,
      providerAccountId: "provider-id",
      access_token: "access",
      refresh_token: "refresh",
      id_token: "email-bearing-id-token",
      scope: "identity",
    });
    expect(linkAccount).toHaveBeenCalledWith({
      userId: "user",
      type: "oauth",
      provider,
      providerAccountId: "provider-id",
    });
  },
);

test("keeps the Twitch API credentials needed by existing integrations", async () => {
  const linkAccount = vi.fn();
  const adapter = withLoginOnlyAccounts({ linkAccount } as ReturnType<
    typeof PrismaAdapter
  >);
  await adapter.linkAccount!({
    userId: "user",
    type: "oauth",
    provider: "twitch",
    providerAccountId: "twitch-id",
    access_token: "access",
    refresh_token: "refresh",
  });
  expect(linkAccount).toHaveBeenCalledWith(
    expect.objectContaining({
      providerAccountId: "twitch-id",
      access_token: "access",
      refresh_token: "refresh",
    }),
  );
});

test("a Google sign-in preserves the chosen display profile and does not write API tokens", async () => {
  await expect(
    authOptions.callbacks!.signIn!({
      user: { id: "user", name: "Chosen name" },
      account: {
        type: "oauth",
        provider: "google",
        providerAccountId: "google-id",
        access_token: "access",
      },
      profile: { name: "Provider name" },
    }),
  ).resolves.toBe(true);
  expect(updateUser).not.toHaveBeenCalled();
  expect(updateAccount).not.toHaveBeenCalled();
});

test("attests only to the original account email and preserves it when linking a different address", async () => {
  const signIn = authOptions.events!.signIn!;
  const user = { id: "user", email: "original@example.com" };
  const profile = (email: string, verified: boolean) => ({
    email,
    email_verified: verified,
  });
  const account = {
    type: "oauth" as const,
    provider: "google",
    providerAccountId: "google-id",
  };
  await signIn({
    user,
    account,
    profile: profile("different@example.com", true),
  });
  expect(updateUser).not.toHaveBeenCalled();
  await signIn({
    user,
    account,
    profile: profile("ORIGINAL@example.com", true),
  });
  expect(updateUser).toHaveBeenLastCalledWith({
    where: { id: "user" },
    data: { emailVerified: expect.any(Date) },
  });
  await signIn({
    user,
    account,
    profile: profile("original@example.com", false),
  });
  expect(updateUser).toHaveBeenLastCalledWith({
    where: { id: "user" },
    data: { emailVerified: null },
  });
});

test("unverified email claims cannot grant access to donation pixels", async () => {
  const user: NonNullable<Session["user"]> = {
    id: "user",
    email: "donor@example.com",
    emailVerified: false,
    roles: [],
    isSuperUser: false,
  };
  await expect(getMyPixels("mural", user)).resolves.toEqual([]);
  expect(pixels).not.toHaveBeenCalled();
  await getMyPixels("mural", { ...user, emailVerified: true });
  expect(pixels).toHaveBeenCalledOnce();
});

test("keeps the Twitch identity from the provider's OIDC profile", () => {
  expect(
    getProviderAccountProfile("twitch", {
      preferred_username: "TwitchUser",
      name: "Unrelated name",
    }),
  ).toEqual({ username: "TwitchUser", displayName: null });
});

test("keeps Discord's unique username separate from its display name", () => {
  expect(
    getProviderAccountProfile("discord", {
      username: "discord_user",
      discriminator: "0",
      global_name: "Display Name",
    }),
  ).toEqual({ username: "discord_user", displayName: "Display Name" });
  expect(
    getProviderAccountProfile("discord", {
      username: "LegacyUser",
      discriminator: "1234",
    }),
  ).toEqual({ username: "LegacyUser#1234", displayName: null });
});

test("does not treat a Google profile name as a channel username", () => {
  expect(
    getProviderAccountProfile("google", {
      name: "Google Name",
      username: "Not a verified YouTube handle",
    }),
  ).toEqual({ username: null, displayName: "Google Name" });
});

test("leaves missing or unsupported profile names empty", () => {
  expect(getProviderAccountProfile("twitch")).toEqual({
    username: null,
    displayName: null,
  });
  expect(
    getProviderAccountProfile("discord", {
      username: { name: "Invalid username" },
      global_name: "   ",
    }),
  ).toEqual({ username: null, displayName: null });
  expect(
    getProviderAccountProfile("unknown", { username: "Untrusted" }),
  ).toEqual({ username: null, displayName: null });
});

test.each([
  {
    provider: "twitch",
    profile: { preferred_username: "twitch_user" },
    expected: { username: "twitch_user", displayName: null },
  },
  {
    provider: "discord",
    profile: {
      username: "discord_user",
      discriminator: "0",
      global_name: "Provider name",
    },
    expected: { username: "discord_user", displayName: "Provider name" },
  },
  {
    provider: "google",
    profile: { name: "Provider name" },
    expected: { username: null, displayName: "Provider name" },
  },
])(
  "records $provider names on the connected account after successful sign-in",
  async ({ provider, profile, expected }) => {
    await authOptions.events!.signIn!({
      user: { id: "user", name: "Chosen Alveus name" },
      account: {
        type: "oauth",
        provider,
        providerAccountId: "provider-id",
        access_token: "access",
      },
      profile,
    });
    expect(updateAccount).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: "provider-id",
        },
        userId: "user",
      },
      data: expected,
    });
    expect(updateUser).not.toHaveBeenCalled();
  },
);
