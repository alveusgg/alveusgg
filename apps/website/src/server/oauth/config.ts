import { env } from "@/env";

export type OAuthClient = {
  clientId: string;
  redirectUris: string[];
};

const clients: OAuthClient[] = [];

export const OAUTH_SIGNING_ALG = "RS256";
export const OAUTH_ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
export const OAUTH_AUTHORIZATION_CODE_TTL_SECONDS = 60;
export const OAUTH_REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const OAUTH_CODE_CHALLENGE_METHOD = "S256";
export const OAUTH_TOKEN_TYPE = "Bearer";
export const OAUTH_ISSUER = env.NEXT_PUBLIC_BASE_URL;
export const OAUTH_KID = env.OAUTH_KID;
export const OAUTH_AUTHORIZATION_ENDPOINT = `${OAUTH_ISSUER}/oauth/authorize`;
export const OAUTH_TOKEN_ENDPOINT = `${OAUTH_ISSUER}/api/oauth/token`;
export const OAUTH_USERINFO_ENDPOINT = `${OAUTH_ISSUER}/api/oauth/userinfo`;
export const OAUTH_JWKS_URI = `${OAUTH_ISSUER}/.well-known/jwks.json`;

export function getOAuthClient(clientId: string) {
  return clients.find((client) => client.clientId === clientId);
}

export function isAllowedRedirectUri(clientId: string, redirectUri: string) {
  return getOAuthClient(clientId)?.redirectUris.includes(redirectUri) ?? false;
}

export function listOAuthClients() {
  return clients;
}
