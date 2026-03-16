import { z } from "zod";

import { env } from "@/env";

import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";

export const OAuthClientSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUris: z.array(z.url()).min(1),
});

export type OAuthClient = z.infer<typeof OAuthClientSchema>;

const OAuthClientsSchema = z.array(OAuthClientSchema);

export const OAuthClientsJsonSchema = z
  .string()
  .transform((value) => JSON.parse(value))
  .pipe(OAuthClientsSchema);

const clients = OAuthClientsJsonSchema.default([]).parse(
  env.OAUTH_CLIENTS_JSON,
);

export const OAUTH_SIGNING_ALG = "RS256";
export const OAUTH_ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
export const OAUTH_AUTHORIZATION_CODE_TTL_SECONDS = 60;
export const OAUTH_REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const OAUTH_CODE_CHALLENGE_METHOD = "S256";
export const OAUTH_TOKEN_TYPE = "Bearer";
export const OAUTH_FIRST_PARTY_CLIENT_ID = "_self";
export const OAUTH_ISSUER = env.NEXT_PUBLIC_BASE_URL;
export const OAUTH_KID = env.OAUTH_KID;
export const OAUTH_AUTHORIZATION_ENDPOINT = `${OAUTH_ISSUER}/oauth/authorize`;
export const OAUTH_TOKEN_ENDPOINT = `${OAUTH_ISSUER}/api/oauth/token`;
export const OAUTH_USERINFO_ENDPOINT = `${OAUTH_ISSUER}/api/oauth/userinfo`;
export const OAUTH_JWKS_URI = `${OAUTH_ISSUER}/.well-known/jwks.json`;

export function getOAuthClient(clientId: string) {
  return clients.find((client) => client.clientId === clientId);
}

export function isValidOAuthClientSecret(
  clientId: string,
  clientSecret: string,
) {
  const client = getOAuthClient(clientId);
  if (!client) {
    return false;
  }

  return timingSafeCompareString(client.clientSecret, clientSecret);
}

export function isAllowedRedirectUri(clientId: string, redirectUri: string) {
  return getOAuthClient(clientId)?.redirectUris.includes(redirectUri) ?? false;
}

export function listOAuthClients() {
  return clients;
}
