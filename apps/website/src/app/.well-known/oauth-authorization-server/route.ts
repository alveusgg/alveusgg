import {
  OAUTH_AUTHORIZATION_ENDPOINT,
  OAUTH_CODE_CHALLENGE_METHOD,
  OAUTH_ISSUER,
  OAUTH_JWKS_URI,
  OAUTH_TOKEN_ENDPOINT,
  OAUTH_USERINFO_ENDPOINT,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";

export async function GET() {
  if (!hasOAuthSigningKey()) {
    return Response.json(
      {
        error: "server_error",
        error_description: "OAuth signing key is not configured.",
      },
      { status: 503 },
    );
  }

  return Response.json({
    issuer: OAUTH_ISSUER,
    authorization_endpoint: OAUTH_AUTHORIZATION_ENDPOINT,
    token_endpoint: OAUTH_TOKEN_ENDPOINT,
    userinfo_endpoint: OAUTH_USERINFO_ENDPOINT,
    jwks_uri: OAUTH_JWKS_URI,
    response_types_supported: ["code"],
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
      "client_credentials",
    ],
    code_challenge_methods_supported: [OAUTH_CODE_CHALLENGE_METHOD],
    token_endpoint_auth_methods_supported: ["client_secret_basic"],
  });
}
