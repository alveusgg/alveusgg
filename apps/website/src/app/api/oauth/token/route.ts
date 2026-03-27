import { z } from "zod";

import {
  authenticateOAuthClient,
  getInvalidClientHeaders,
} from "@/server/oauth/client-auth";
import { compareAuthorizationCode } from "@/server/oauth/codes";
import {
  OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_TOKEN_TYPE,
  type OAuthClient,
  isAllowedRedirectUri,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";
import {
  OAuthRequestError,
  issueAccessTokenForUser,
  issueRefreshToken,
  verifyRefreshToken,
} from "@/server/oauth/tokens";

const TokenGrantTypeSchema = z.enum(["authorization_code", "refresh_token"]);

const AuthorizationCodeGrantSchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string().min(1),
  redirect_uri: z.string().min(1),
  code_verifier: z.string().min(1),
});

const RefreshTokenGrantSchema = z.object({
  grant_type: z.literal("refresh_token"),
  refresh_token: z.string().min(1),
});

const TokenRequestSchema = z.discriminatedUnion("grant_type", [
  AuthorizationCodeGrantSchema,
  RefreshTokenGrantSchema,
]);

type AuthorizationCodeGrantRequest = z.infer<
  typeof AuthorizationCodeGrantSchema
>;
type RefreshTokenGrantRequest = z.infer<typeof RefreshTokenGrantSchema>;

const TOKEN_RESPONSE_HEADERS = {
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
      "code, redirect_uri, and code_verifier are required.",
    );
  }

  if (!tokenRequestResult.success && grantTypeResult.data === "refresh_token") {
    throw new OAuthRequestError(
      400,
      "invalid_request",
      "refresh_token is required.",
    );
  }

  if (!tokenRequestResult.success) {
    throw new OAuthRequestError(400, "invalid_request", "Invalid request.");
  }

  return tokenRequestResult.data;
}

async function issueTokensForUser(userId: string, clientId: string) {
  return {
    access_token: await issueAccessTokenForUser({ userId, clientId }),
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

async function handleAuthorizationCodeGrant(
  {
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  }: AuthorizationCodeGrantRequest,
  client: OAuthClient,
) {
  if (!isAllowedRedirectUri(client.clientId, redirectUri)) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Authorization code mismatch.",
    );
  }

  const claims = await compareAuthorizationCode({
    code,
    clientId: client.clientId,
    redirectUri,
    codeVerifier,
  });

  return issueTokenPairForUser(claims.sub, client.clientId);
}

async function handleRefreshTokenGrant(
  { refresh_token: refreshToken }: RefreshTokenGrantRequest,
  client: OAuthClient,
) {
  const claims = await verifyRefreshToken(refreshToken);
  if (claims.client_id !== client.clientId) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Refresh token mismatch.",
    );
  }

  const tokens = await issueTokensForUser(claims.sub, client.clientId);
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

    const client = authenticateOAuthClient(request);
    const formData = await request.formData();
    const tokenRequest = parseTokenRequest(formData);

    if (tokenRequest.grant_type === "authorization_code") {
      const response = await handleAuthorizationCodeGrant(tokenRequest, client);
      return Response.json(response, {
        headers: TOKEN_RESPONSE_HEADERS,
      });
    }

    if (tokenRequest.grant_type === "refresh_token") {
      const response = await handleRefreshTokenGrant(tokenRequest, client);
      return Response.json(response, {
        headers: TOKEN_RESPONSE_HEADERS,
      });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof OAuthRequestError) {
      return Response.json(
        {
          error: error.error,
          error_description: error.message,
        },
        {
          status: error.status,
          headers: {
            ...TOKEN_RESPONSE_HEADERS,
            ...(error.status === 401 && error.error === "invalid_client"
              ? getInvalidClientHeaders()
              : {}),
          },
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
