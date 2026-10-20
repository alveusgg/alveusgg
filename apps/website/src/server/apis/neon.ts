import { z } from "zod";

import { env } from "@/env";

// Neon CRM acts as an OAuth 2.0 provider for constituent (donor) logins.
// https://developer.neoncrm.com/authenticating-constituents/

const NEON_OAUTH_TOKEN_URL = "https://app.neoncrm.com/np/oauth/token";

export type NeonOAuthConfig = {
  orgId: string;
  clientId: string;
  clientSecret: string;
};

export function getNeonOAuthConfig(): NeonOAuthConfig | null {
  const orgId = env.NEON_CRM_ORG_ID;
  const clientId = env.NEON_OAUTH_CLIENT_ID;
  const clientSecret = env.NEON_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  return { orgId, clientId, clientSecret };
}

export function getNeonOAuthRedirectUri() {
  return `${env.NEXT_PUBLIC_BASE_URL}/api/neon/callback`;
}

export function getNeonAuthorizeUrl(
  config: NeonOAuthConfig,
  { redirectUri, state }: { redirectUri: string; state: string },
) {
  const url = new URL(`https://${config.orgId}.app.neoncrm.com/np/oauth/auth`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

// Neon's donor portal logout. It can't send donors back to us, and without a
// Neon session it shows Neon's staff login instead, so we only link to it.
export function getNeonLogoutUrl(config: NeonOAuthConfig) {
  return `https://${config.orgId}.app.neoncrm.com/nx/logout`;
}

// Neon does not issue real access tokens: the "access token" is the account ID
// of the constituent that logged in, so it must never leave the server.
const tokenResponseSchema = z.object({
  access_token: z.string().regex(/^[0-9]+$/),
});

export async function exchangeNeonAuthorizationCode(
  config: NeonOAuthConfig,
  { code, redirectUri }: { code: string; redirectUri: string },
) {
  const response = await fetch(NEON_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Neon OAuth: token request failed with status ${response.status}`,
    );
  }

  const parsed = tokenResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsed.success) {
    throw new Error("Neon OAuth: unexpected token response");
  }

  return { accountId: parsed.data.access_token };
}
