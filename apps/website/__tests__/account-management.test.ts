import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  ACCOUNT_LINK_COOKIE,
  ACCOUNT_LINK_MAX_AGE,
  RECENT_AUTH_COOKIE,
  WEBSITE_SESSION_COOKIE,
  createAuthAction,
  isSameOrigin,
  verifyAuthAction,
} from "@/server/auth/actions";
import { withAccountManagement } from "@/server/auth/options";

const { env, getSessionAndUser, getUserByAccount, onSignIn } = vi.hoisted(
  () => ({
    env: {
      NEXTAUTH_SECRET: "test-account-actions-secret",
      NEXT_PUBLIC_BASE_URL: "https://alveus.example",
    },
    getSessionAndUser: vi.fn(),
    getUserByAccount: vi.fn(),
    onSignIn: vi.fn(),
  }),
);
vi.mock("@/env", () => ({ env }));

beforeEach(() => {
  vi.resetAllMocks();
  onSignIn.mockResolvedValue(true);
  getSessionAndUser.mockResolvedValue({
    user: { id: "user" },
    session: { expires: new Date(Date.now() + 3600000) },
  });
  getUserByAccount.mockResolvedValue(null);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("account action cookies", () => {
  test("binds a link request to both user and provider", async () => {
    const token = await createAuthAction("account-link", "user", "twitch");
    expect(
      await verifyAuthAction(token, "account-link", "user", "twitch"),
    ).toBe(true);
    expect(
      await verifyAuthAction(token, "account-link", "other-user", "twitch"),
    ).toBe(false);
    expect(
      await verifyAuthAction(token, "account-link", "user", "google"),
    ).toBe(false);
    expect(await verifyAuthAction(token, "recent-auth", "user")).toBe(false);
    expect(token).not.toContain("twitch");
  });
  test("rejects modified and expired requests", async () => {
    vi.useFakeTimers();
    const token = await createAuthAction("account-link", "user", "twitch");
    const parts = token.split(".");
    parts[3] = (parts[3]!.startsWith("a") ? "b" : "a") + parts[3]!.slice(1);
    expect(
      await verifyAuthAction(parts.join("."), "account-link", "user", "twitch"),
    ).toBe(false);
    vi.advanceTimersByTime((ACCOUNT_LINK_MAX_AGE + 1) * 1000);
    expect(
      await verifyAuthAction(token, "account-link", "user", "twitch"),
    ).toBe(false);
  });
  test("requires the website origin for account mutations", () => {
    expect(
      isSameOrigin({ headers: { origin: env.NEXT_PUBLIC_BASE_URL } }),
    ).toBe(true);
    expect(isSameOrigin({ headers: { origin: "https://other.example" } })).toBe(
      false,
    );
    expect(isSameOrigin({ headers: {} })).toBe(false);
  });
});

function options(cookies: Record<string, string> = {}) {
  const headers = new Map<string, string | string[]>();
  const res = {
    getHeader: (name: string) => headers.get(name),
    setHeader: (name: string, value: string | string[]) =>
      headers.set(name, value),
  } as unknown as NextApiResponse;
  const options: NextAuthOptions = {
    providers: [],
    adapter: { getSessionAndUser, getUserByAccount },
    callbacks: { signIn: onSignIn },
  };
  const configured = withAccountManagement(
    options,
    { cookies } as NextApiRequest,
    res,
  );
  const signIn = () =>
    configured.callbacks!.signIn!({
      user: { id: "provider-profile" },
      account: {
        provider: "twitch",
        providerAccountId: "twitch-user",
        type: "oauth",
      },
    });
  return { configured, signIn, headers };
}

describe("linking and reauthentication", () => {
  test("allows an ordinary login without an existing session", async () => {
    expect(await options().signIn()).toBe(true);
  });
  test("allows reauthentication with the same linked account", async () => {
    getUserByAccount.mockResolvedValue({ id: "user" });
    expect(
      await options({ [WEBSITE_SESSION_COOKIE]: "session" }).signIn(),
    ).toBe(true);
  });
  test("refuses an account owned by another Alveus user before credential updates", async () => {
    getUserByAccount.mockResolvedValue({ id: "other" });
    expect(
      await options({ [WEBSITE_SESSION_COOKIE]: "session" }).signIn(),
    ).toContain("already-linked");
    expect(onSignIn).not.toHaveBeenCalled();
  });
  test("requires both recent authentication and an explicit link request", async () => {
    const recent = await createAuthAction("recent-auth", "user");
    const intent = await createAuthAction("account-link", "user", "twitch");
    for (const cookies of [
      {},
      { [RECENT_AUTH_COOKIE]: recent },
      { [ACCOUNT_LINK_COOKIE]: intent },
      {
        [ACCOUNT_LINK_COOKIE]: await createAuthAction(
          "account-link",
          "other",
          "twitch",
        ),
        [RECENT_AUTH_COOKIE]: recent,
      },
      {
        [ACCOUNT_LINK_COOKIE]: await createAuthAction(
          "account-link",
          "user",
          "google",
        ),
        [RECENT_AUTH_COOKIE]: recent,
      },
    ]) {
      expect(
        await options({
          [WEBSITE_SESSION_COOKIE]: "session",
          ...cookies,
        }).signIn(),
      ).toContain("link-required");
    }
    expect(onSignIn).not.toHaveBeenCalled();
    const allowed = options({
      [WEBSITE_SESSION_COOKIE]: "session",
      [RECENT_AUTH_COOKIE]: recent,
      [ACCOUNT_LINK_COOKIE]: intent,
    });
    expect(await allowed.signIn()).toBe(true);
    expect(allowed.headers.get("Set-Cookie")).toEqual(
      expect.arrayContaining([expect.stringContaining("Max-Age=0")]),
    );
  });
  test("does not turn a link whose session expired into a signup", async () => {
    getSessionAndUser.mockResolvedValue({
      user: { id: "user" },
      session: { expires: new Date(0) },
    });
    const request = options({
      [WEBSITE_SESSION_COOKIE]: "session",
      [ACCOUNT_LINK_COOKIE]: await createAuthAction(
        "account-link",
        "user",
        "twitch",
      ),
    });
    expect(await request.signIn()).toBe("/auth/signin?error=SessionRequired");
    expect(onSignIn).not.toHaveBeenCalled();
  });
  test("issues recent authentication only after a successful provider sign-in event", async () => {
    const request = options();
    await request.configured.events!.signIn!({
      user: { id: "user" },
      account: null,
      isNewUser: false,
    });
    const cookies = request.headers.get("Set-Cookie") as string[];
    const value = cookies
      .find((cookie) => cookie.startsWith(`${RECENT_AUTH_COOKIE}=`))!
      .split(";")[0]!
      .slice(RECENT_AUTH_COOKIE.length + 1);
    expect(
      await verifyAuthAction(decodeURIComponent(value), "recent-auth", "user"),
    ).toBe(true);
    expect(cookies[0]).toContain("HttpOnly; SameSite=Lax");
    expect(cookies[0]).toContain("Secure");
  });
});
