import { beforeEach, describe, expect, test, vi } from "vitest";

import { OAuthRequestError } from "@/server/oauth/tokens";

import { POST } from "@/app/api/oauth/token/route";
import { GET as getAuthorizationServerMetadata } from "@/app/.well-known/oauth-authorization-server/route";

const {
  mockAuthenticateOAuthClient,
  mockCompareAuthorizationCode,
  mockHasOAuthSigningKey,
  mockIsAllowedRedirectUri,
  mockIssueAccessTokenForUser,
  mockIssueRefreshToken,
  mockVerifyRefreshToken,
} = vi.hoisted(() => {
  return {
    mockAuthenticateOAuthClient: vi.fn(),
    mockCompareAuthorizationCode: vi.fn(),
    mockHasOAuthSigningKey: vi.fn(),
    mockIsAllowedRedirectUri: vi.fn(),
    mockIssueAccessTokenForUser: vi.fn(),
    mockIssueRefreshToken: vi.fn(),
    mockVerifyRefreshToken: vi.fn(),
  };
});

vi.mock("@/server/oauth/client-auth", () => {
  return {
    authenticateOAuthClient: mockAuthenticateOAuthClient,
    getInvalidClientHeaders: () => ({
      "WWW-Authenticate": 'Basic realm="oauth", error="invalid_client"',
    }),
  };
});

vi.mock("@/server/oauth/codes", () => {
  return {
    compareAuthorizationCode: mockCompareAuthorizationCode,
  };
});

vi.mock("@/server/oauth/config", () => {
  return {
    OAUTH_ACCESS_TOKEN_TTL_SECONDS: 600,
    OAUTH_AUTHORIZATION_ENDPOINT: "http://localhost:3000/oauth/authorize",
    OAUTH_CODE_CHALLENGE_METHOD: "S256",
    OAUTH_ISSUER: "http://localhost:3000",
    OAUTH_JWKS_URI: "http://localhost:3000/.well-known/jwks.json",
    OAUTH_TOKEN_ENDPOINT: "http://localhost:3000/api/oauth/token",
    OAUTH_TOKEN_TYPE: "Bearer",
    OAUTH_USERINFO_ENDPOINT: "http://localhost:3000/api/oauth/userinfo",
    isAllowedRedirectUri: mockIsAllowedRedirectUri,
  };
});

vi.mock("@/server/oauth/keys", () => {
  return {
    hasOAuthSigningKey: mockHasOAuthSigningKey,
  };
});

vi.mock("@/server/oauth/tokens", async () => {
  const actual = await vi.importActual("@/server/oauth/tokens");
  return {
    ...actual,
    OAuthRequestError: actual.OAuthRequestError,
    issueAccessTokenForUser: mockIssueAccessTokenForUser,
    issueRefreshToken: mockIssueRefreshToken,
    verifyRefreshToken: mockVerifyRefreshToken,
  };
});

function createFormRequest(
  body: Record<string, string>,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost:3000/api/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body: new URLSearchParams(body),
  });
}

describe("oauth token route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthenticateOAuthClient.mockReturnValue({
      clientId: "census-production",
      clientSecret: "top-secret",
      redirectUris: ["http://localhost:3001/callback"],
    });
    mockCompareAuthorizationCode.mockResolvedValue({ sub: "user-1" });
    mockHasOAuthSigningKey.mockReturnValue(true);
    mockIsAllowedRedirectUri.mockReturnValue(true);
    mockIssueAccessTokenForUser.mockResolvedValue("access-token");
    mockIssueRefreshToken.mockResolvedValue("refresh-token");
    mockVerifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      client_id: "census-production",
    });
  });

  test("exchanges an authorization code for tokens", async () => {
    const response = await POST(
      createFormRequest({
        grant_type: "authorization_code",
        code: "auth-code",
        redirect_uri: "http://localhost:3001/callback",
        code_verifier: "pkce-verifier",
      }),
    );
    if (!response) {
      throw new Error("Expected response.");
    }

    expect(response.status).toBe(200);
    expect(await response.json()).toStrictEqual({
      access_token: "access-token",
      expires_in: 600,
      refresh_token: "refresh-token",
      token_type: "Bearer",
    });
    expect(mockAuthenticateOAuthClient).toHaveBeenCalledOnce();
    expect(mockCompareAuthorizationCode).toHaveBeenCalledWith({
      code: "auth-code",
      clientId: "census-production",
      redirectUri: "http://localhost:3001/callback",
      codeVerifier: "pkce-verifier",
    });
  });

  test("returns a Basic challenge when client authentication fails", async () => {
    mockAuthenticateOAuthClient.mockImplementation(() => {
      throw new OAuthRequestError(
        401,
        "invalid_client",
        "Missing client authentication.",
      );
    });

    const response = await POST(
      createFormRequest({
        grant_type: "refresh_token",
        refresh_token: "refresh-token",
      }),
    );
    if (!response) {
      throw new Error("Expected response.");
    }

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toContain("Basic");
    expect(await response.json()).toStrictEqual({
      error: "invalid_client",
      error_description: "Missing client authentication.",
    });
  });

  test("rejects redirect URI mismatches as invalid_grant", async () => {
    mockIsAllowedRedirectUri.mockReturnValue(false);

    const response = await POST(
      createFormRequest({
        grant_type: "authorization_code",
        code: "auth-code",
        redirect_uri: "http://localhost:3001/other",
        code_verifier: "pkce-verifier",
      }),
    );
    if (!response) {
      throw new Error("Expected response.");
    }

    expect(response.status).toBe(400);
    expect(await response.json()).toStrictEqual({
      error: "invalid_grant",
      error_description: "Authorization code mismatch.",
    });
  });

  test("rejects refresh token client mismatches", async () => {
    mockVerifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      client_id: "different-client",
    });

    const response = await POST(
      createFormRequest({
        grant_type: "refresh_token",
        refresh_token: "refresh-token",
      }),
    );
    if (!response) {
      throw new Error("Expected response.");
    }

    expect(response.status).toBe(400);
    expect(await response.json()).toStrictEqual({
      error: "invalid_grant",
      error_description: "Refresh token mismatch.",
    });
  });
});

describe("oauth authorization server metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasOAuthSigningKey.mockReturnValue(true);
  });

  test("advertises client_secret_basic", async () => {
    const response = await getAuthorizationServerMetadata();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      token_endpoint_auth_methods_supported: ["client_secret_basic"],
      code_challenge_methods_supported: ["S256"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      response_types_supported: ["code"],
    });
  });
});
