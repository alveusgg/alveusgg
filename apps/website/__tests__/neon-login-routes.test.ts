import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createNeonOAuthState,
  getNeonDonorSession,
} from "@/server/utils/neon-donor-session";

import { GET as callback } from "@/app/api/neon/callback/route";
import { GET as login } from "@/app/api/neon/login/route";
import { POST as logout } from "@/app/api/neon/logout/route";

const { mockEnv, syncDonations } = vi.hoisted(() => ({
  syncDonations: vi.fn(),
  mockEnv: {
    DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
    NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:3000",
    NEON_CRM_ORG_ID: "alveustest",
    NEON_OAUTH_CLIENT_ID: "client-id" as string | undefined,
    NEON_OAUTH_CLIENT_SECRET: "client-secret",
  },
}));

vi.mock("@/env", () => ({ env: mockEnv }));
vi.mock("@/server/utils/neon-donations", () => ({
  syncNeonDonationAccounts: syncDonations,
}));

const base = "http://127.0.0.1:3000";
const stateCookieName = "alveus.neon-oauth-state";
const sessionCookieName = "alveus.neon-donor";

function request(path: string, cookies: Record<string, string> = {}) {
  return new NextRequest(`${base}${path}`, {
    headers: {
      cookie: Object.entries(cookies)
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join("; "),
    },
  });
}

beforeEach(() => {
  mockEnv.NEON_OAUTH_CLIENT_ID = "client-id";
  syncDonations.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("login", () => {
  test("redirects to Neon and remembers the state", async () => {
    const response = await login(
      request("/api/neon/login?returnTo=/institute/pixels/x/rename"),
    );

    const location = new URL(response.headers.get("location") ?? "");
    expect(location.origin).toBe("https://alveustest.app.neoncrm.com");
    expect(location.searchParams.get("redirect_uri")).toBe(
      `${base}/api/neon/callback`,
    );

    const state = location.searchParams.get("state");
    expect(state).toBeTruthy();
    const stateCookie = response.cookies.get(stateCookieName);
    expect(stateCookie?.httpOnly).toBe(true);
    expect(stateCookie?.sameSite).toBe("lax");
  });

  test("is not available without config", async () => {
    mockEnv.NEON_OAUTH_CLIENT_ID = undefined;
    const response = await login(request("/api/neon/login"));
    expect(response.status).toBe(404);
  });
});

describe("callback", () => {
  test("creates a donor session for a valid code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ access_token: "101177" })),
    );
    const { state, cookie } = await createNeonOAuthState(
      "/institute/pixels/x/rename",
    );

    const response = await callback(
      request(`/api/neon/callback?code=abc&state=${state}`, {
        [stateCookieName]: cookie,
      }),
    );

    expect(response.headers.get("location")).toBe(
      `${base}/institute/pixels/x/rename`,
    );
    expect(response.cookies.get(stateCookieName)?.value).toBe("");
    const session = response.cookies.get(sessionCookieName);
    expect(session?.maxAge).toBe(3600);
    await expect(getNeonDonorSession(session?.value)).resolves.toEqual({
      accountId: "101177",
    });
    expect(syncDonations).toHaveBeenCalledExactlyOnceWith("101177");
  });

  test("still logs in when donation ownership sync fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    syncDonations.mockRejectedValue(new Error("Neon temporarily unavailable"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ access_token: "101177" })),
    );
    const { state, cookie } = await createNeonOAuthState(
      "/institute/pixels/two/rename",
    );

    const response = await callback(
      request(`/api/neon/callback?code=abc&state=${state}`, {
        [stateCookieName]: cookie,
      }),
    );

    expect(response.headers.get("location")).toBe(
      `${base}/institute/pixels/two/rename`,
    );
    await expect(
      getNeonDonorSession(response.cookies.get(sessionCookieName)?.value),
    ).resolves.toEqual({ accountId: "101177" });
  });

  test("rejects a state that does not match the cookie", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { cookie } = await createNeonOAuthState("/institute/pixels/x/rename");

    const response = await callback(
      request("/api/neon/callback?code=abc&state=forged", {
        [stateCookieName]: cookie,
      }),
    );

    expect(response.headers.get("location")).toBe(
      `${base}/institute/pixels?neonLogin=failed`,
    );
    expect(response.cookies.get(sessionCookieName)).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("reports a cancelled login", async () => {
    const { state, cookie } = await createNeonOAuthState("/donate?a=1");

    const response = await callback(
      request(`/api/neon/callback?state=${state}`, {
        [stateCookieName]: cookie,
      }),
    );

    expect(response.headers.get("location")).toBe(
      `${base}/donate?a=1&neonLogin=failed`,
    );
  });

  test("reports a failed code exchange", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Invalid Request", { status: 400 })),
    );
    const { state, cookie } = await createNeonOAuthState("/donate");

    const response = await callback(
      request(`/api/neon/callback?code=expired&state=${state}`, {
        [stateCookieName]: cookie,
      }),
    );

    expect(response.headers.get("location")).toBe(
      `${base}/donate?neonLogin=failed`,
    );
    expect(response.cookies.get(sessionCookieName)).toBeUndefined();
  });
});

describe("logout", () => {
  test("clears the session and goes back to the page", async () => {
    const response = await logout(
      request(
        `/api/neon/logout?returnTo=${encodeURIComponent("/institute/pixels/x/rename?via=website")}`,
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `${base}/institute/pixels/x/rename?via=website&neonLogin=loggedOut`,
    );
    expect(response.cookies.get(sessionCookieName)?.value).toBe("");
  });

  test("does not leave the site", async () => {
    const response = await logout(
      request("/api/neon/logout?returnTo=https://evil.example/"),
    );

    expect(new URL(response.headers.get("location") ?? "").origin).toBe(base);
  });
});
