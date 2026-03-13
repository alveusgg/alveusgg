import { z } from "zod";

import { compareAuthorizationCode } from "@/server/oauth/codes";
import {
  OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_TOKEN_TYPE,
  getOAuthClient,
  isAllowedRedirectUri,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";
import {
  OAuthRequestError,
  getOAuthUser,
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
} from "@/server/oauth/tokens";

const TokenGrantTypeSchema = z.enum(["authorization_code", "refresh_token"]);

const AuthorizationCodeGrantSchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string().min(1),
  client_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  code_verifier: z.string().min(1),
});

const RefreshTokenGrantSchema = z.object({
  grant_type: z.literal("refresh_token"),
  refresh_token: z.string().min(1),
  client_id: z.string().min(1),
});

const TokenRequestSchema = z.discriminatedUnion("grant_type", [
  AuthorizationCodeGrantSchema,
  RefreshTokenGrantSchema,
]);

type AuthorizationCodeGrantRequest = z.infer<
  typeof AuthorizationCodeGrantSchema
>;
type RefreshTokenGrantRequest = z.infer<typeof RefreshTokenGrantSchema>;

const OAUTH_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const TOKEN_RESPONSE_HEADERS = {
  ...OAUTH_CORS_HEADERS,
  "Cache-Control": "no-store",
};

function parseTokenRequest(formData: FormData) {
  const requestData = Object.fromEntries(formData.entries());

  const grantTypeResult = TokenGrantTypeSchema.safeParse(
    requestData.grant_type,
  );
  if (!grantTypeResult.success) {
    throw new OAuthRequestError(
      400,
      "invalid_request",
      "grant_type is required.",
    );
  }

  const tokenRequestResult = TokenRequestSchema.safeParse(requestData);
  if (
    !tokenRequestResult.success &&
    grantTypeResult.data === "authorization_code"
  ) {
    throw new OAuthRequestError(
      400,
      "invalid_request",
      "code, client_id, redirect_uri, and code_verifier are required.",
    );
  }

  if (!tokenRequestResult.success && grantTypeResult.data === "refresh_token") {
    throw new OAuthRequestError(
      400,
      "invalid_request",
      "refresh_token and client_id are required.",
    );
  }

  if (!tokenRequestResult.success) {
    throw new OAuthRequestError(400, "invalid_request", "Invalid request.");
  }

  return tokenRequestResult.data;
}

async function issueTokensForUser(userId: string, clientId: string) {
  const user = await getOAuthUser(userId);
  if (!user) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "User is no longer available.",
    );
  }

  const accessToken = await issueAccessToken({
    subject: user.id,
    clientId,
    roles: user.roles,
  });

  return {
    access_token: accessToken,
    token_type: OAUTH_TOKEN_TYPE,
    expires_in: OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  };
}

async function issueTokenPairForUser(userId: string, clientId: string) {
  const [accessTokenResponse, refreshToken] = await Promise.all([
    issueTokensForUser(userId, clientId),
    issueRefreshToken({
      subject: userId,
      clientId,
    }),
  ]);

  return {
    ...accessTokenResponse,
    refresh_token: refreshToken,
  };
}

async function handleAuthorizationCodeGrant({
  code,
  client_id: clientId,
  redirect_uri: redirectUri,
  code_verifier: codeVerifier,
}: AuthorizationCodeGrantRequest) {
  if (
    !getOAuthClient(clientId) ||
    !isAllowedRedirectUri(clientId, redirectUri)
  ) {
    throw new OAuthRequestError(
      401,
      "invalid_client",
      "OAuth client is not allowed.",
    );
  }

  const claims = await compareAuthorizationCode({
    code,
    clientId,
    redirectUri,
    codeVerifier,
  });

  return issueTokenPairForUser(claims.sub, clientId);
}

async function handleRefreshTokenGrant({
  refresh_token: refreshToken,
  client_id: clientId,
}: RefreshTokenGrantRequest) {
  if (!getOAuthClient(clientId)) {
    throw new OAuthRequestError(
      401,
      "invalid_client",
      "OAuth client is not allowed.",
    );
  }

  const claims = await verifyRefreshToken(refreshToken);
  if (claims.client_id !== clientId) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Refresh token mismatch.",
    );
  }

  const tokens = await issueTokensForUser(claims.sub, clientId);
  return {
    access_token: tokens.access_token,
    refresh_token: refreshToken,
    token_type: tokens.token_type,
    expires_in: tokens.expires_in,
  };
}

export async function POST(request: Request) {
  try {
    if (!hasOAuthSigningKey()) {
      throw new OAuthRequestError(
        503,
        "server_error",
        "OAuth signing key is not configured.",
      );
    }

    const formData = await request.formData();
    const tokenRequest = parseTokenRequest(formData);

    if (tokenRequest.grant_type === "authorization_code") {
      const response = await handleAuthorizationCodeGrant(tokenRequest);
      return Response.json(response, {
        headers: TOKEN_RESPONSE_HEADERS,
      });
    }

    if (tokenRequest.grant_type === "refresh_token") {
      const response = await handleRefreshTokenGrant(tokenRequest);
      return Response.json(response, {
        headers: TOKEN_RESPONSE_HEADERS,
      });
    }
  } catch (error) {
    if (error instanceof OAuthRequestError) {
      return Response.json(
        {
          error: error.error,
          error_description: error.message,
        },
        {
          status: error.status,
          headers: TOKEN_RESPONSE_HEADERS,
        },
      );
    }

    console.error(error);
    return Response.json(
      {
        error: "server_error",
        error_description: "OAuth token exchange failed.",
      },
      {
        status: 500,
        headers: TOKEN_RESPONSE_HEADERS,
      },
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: OAUTH_CORS_HEADERS,
  });
}
