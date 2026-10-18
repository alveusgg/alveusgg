import { afterEach, describe, expect, test, vi } from "vitest";

import {
  type NeonOAuthConfig,
  exchangeNeonAuthorizationCode,
  getNeonAuthorizeUrl,
  getNeonLogoutUrl,
} from "@/server/apis/neon";

vi.mock("@/env", () => {
  return {
    env: {
      NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:3000",
    },
  };
});

const config: NeonOAuthConfig = {
  orgId: "alveustest",
  clientId: "client-id",
  clientSecret: "client-secret",
};

const redirectUri = "http://127.0.0.1:3000/api/neon/callback";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getNeonAuthorizeUrl", () => {
  test("points to the org's login page with code flow params", () => {
    const url = new URL(
      getNeonAuthorizeUrl(config, { redirectUri, state: "abc" }),
    );

    expect(url.origin).toBe("https://alveustest.app.neoncrm.com");
    expect(url.pathname).toBe("/np/oauth/auth");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: "code",
      client_id: "client-id",
      redirect_uri: redirectUri,
      state: "abc",
    });
  });
});

describe("getNeonLogoutUrl", () => {
  test("sends the user back to the target URL", () => {
    const url = new URL(
      getNeonLogoutUrl(config, "http://127.0.0.1:3000/institute/pixels"),
    );

    expect(url.origin).toBe("https://alveustest.app.neoncrm.com");
    expect(url.pathname).toBe("/np/logout.do");
    expect(url.searchParams.get("targetUrl")).toBe(
      "http://127.0.0.1:3000/institute/pixels",
    );
  });
});

describe("exchangeNeonAuthorizationCode", () => {
  test("posts the code as a form and returns the account ID", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ access_token: "101177" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      exchangeNeonAuthorizationCode(config, { code: "the-code", redirectUri }),
    ).resolves.toEqual({ accountId: "101177" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://app.neoncrm.com/np/oauth/token");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({
      client_id: "client-id",
      client_secret: "client-secret",
      redirect_uri: redirectUri,
      code: "the-code",
      grant_type: "authorization_code",
    });
  });

  test("rejects failed token requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Invalid Request", { status: 400 })),
    );

    await expect(
      exchangeNeonAuthorizationCode(config, { code: "expired", redirectUri }),
    ).rejects.toThrow("status 400");
  });

  test.each([
    ["an error body", { error: "invalid_grant" }],
    ["a non-numeric account ID", { access_token: "../101177" }],
    ["a non-JSON body", "<html></html>"],
  ])("rejects %s", async (_, body) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        typeof body === "string" ? new Response(body) : Response.json(body),
      ),
    );

    await expect(
      exchangeNeonAuthorizationCode(config, { code: "the-code", redirectUri }),
    ).rejects.toThrow("unexpected token response");
  });
});
