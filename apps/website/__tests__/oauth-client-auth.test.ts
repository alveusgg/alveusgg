import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  authenticateOAuthClient,
  getInvalidClientHeaders,
  parseBasicClientCredentials,
} from "@/server/oauth/client-auth";
import { OAuthRequestError } from "@/server/oauth/tokens";

vi.mock("@/env", () => {
  return {
    env: {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      OAUTH_CLIENTS_JSON: JSON.stringify([
        {
          clientId: "census-production",
          clientSecret: "top-secret",
          name: "Census",
          redirectUris: ["http://localhost:3001/callback"],
        },
      ]),
      OAUTH_KID: "oauth-1",
    },
  };
});

vi.mock("@/server/oauth/tokens", async () => {
  const actual = await vi.importActual("@/server/oauth/tokens");
  return {
    OAuthRequestError: actual.OAuthRequestError,
  };
});

function createBasicAuthorizationValue(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`;
}

describe("oauth client auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("parses Basic auth credentials", () => {
    const request = new Request("http://localhost/api/oauth/token", {
      headers: {
        authorization: createBasicAuthorizationValue(
          "census-production",
          "top-secret",
        ),
      },
    });

    expect(parseBasicClientCredentials(request)).toStrictEqual({
      clientId: "census-production",
      clientSecret: "top-secret",
    });
  });

  test("authenticates a configured confidential client", () => {
    const request = new Request("http://localhost/api/oauth/token", {
      headers: {
        authorization: createBasicAuthorizationValue(
          "census-production",
          "top-secret",
        ),
      },
    });

    expect(authenticateOAuthClient(request)).toMatchObject({
      clientId: "census-production",
      redirectUris: ["http://localhost:3001/callback"],
    });
  });

  test("rejects missing Basic auth", () => {
    const request = new Request("http://localhost/api/oauth/token");

    expect(() => authenticateOAuthClient(request)).toThrowError(
      OAuthRequestError,
    );
    expect(() => authenticateOAuthClient(request)).toThrow(
      "Missing client authentication.",
    );
  });

  test("rejects unknown clients", () => {
    const request = new Request("http://localhost/api/oauth/token", {
      headers: {
        authorization: createBasicAuthorizationValue(
          "unknown-client",
          "secret",
        ),
      },
    });

    expect(() => authenticateOAuthClient(request)).toThrowError(
      OAuthRequestError,
    );
    expect(() => authenticateOAuthClient(request)).toThrow(
      "Client authentication failed.",
    );
  });

  test("rejects the wrong client secret", () => {
    const request = new Request("http://localhost/api/oauth/token", {
      headers: {
        authorization: createBasicAuthorizationValue(
          "census-production",
          "wrong-secret",
        ),
      },
    });

    expect(() => authenticateOAuthClient(request)).toThrowError(
      OAuthRequestError,
    );
    expect(() => authenticateOAuthClient(request)).toThrow(
      "Client authentication failed.",
    );
  });

  test("returns the Basic challenge header", () => {
    expect(getInvalidClientHeaders()).toStrictEqual({
      "WWW-Authenticate": 'Basic realm="oauth", error="invalid_client"',
    });
  });
});
