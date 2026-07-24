import { randomBytes } from "node:crypto";

import { RedisValueAlreadyExistsError, getRedis } from "@/server/utils/redis";

import {
  OAUTH_AUTHORIZATION_CODE_TTL_SECONDS,
  OAUTH_CODE_CHALLENGE_METHOD,
} from "./config";
import { createPkceS256Challenge, encodeBase64Url } from "./helper";
import { OAuthRequestError } from "./tokens";

export type OAuthAuthorizationCodeClaims = {
  sub: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: typeof OAUTH_CODE_CHALLENGE_METHOD;
};

const OAUTH_AUTHORIZATION_CODE_KEY_PREFIX = "oauth:authorization-code";

interface CompareAuthorizationCodeParams {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}

function getOAuthAuthorizationCodeKey(code: string) {
  return `${OAUTH_AUTHORIZATION_CODE_KEY_PREFIX}:${code}`;
}

export class AuthorizationCodeStore {
  readonly redis = getRedis();

  async issue(claims: OAuthAuthorizationCodeClaims): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = encodeBase64Url(randomBytes(32));
      try {
        await this.redis.set(getOAuthAuthorizationCodeKey(code), claims, {
          expiry: OAUTH_AUTHORIZATION_CODE_TTL_SECONDS,
          overwrite: false,
        });
        return code;
      } catch (error) {
        if (error instanceof RedisValueAlreadyExistsError) {
          continue;
        }

        throw error;
      }
    }

    throw new OAuthRequestError(
      500,
      "server_error",
      "Failed to issue authorization code.",
    );
  }

  async compare({
    code,
    clientId,
    redirectUri,
    codeVerifier,
  }: CompareAuthorizationCodeParams) {
    const claims = await this.consume(code);

    if (!claims) {
      throw new OAuthRequestError(
        400,
        "invalid_grant",
        "Authorization code is invalid or expired.",
      );
    }

    if (claims.client_id !== clientId || claims.redirect_uri !== redirectUri) {
      throw new OAuthRequestError(
        400,
        "invalid_grant",
        "Authorization code mismatch.",
      );
    }

    if (claims.code_challenge_method !== OAUTH_CODE_CHALLENGE_METHOD) {
      throw new OAuthRequestError(
        400,
        "invalid_grant",
        "Invalid code challenge method.",
      );
    }

    const expectedChallenge = await createPkceS256Challenge(codeVerifier);
    if (expectedChallenge !== claims.code_challenge) {
      throw new OAuthRequestError(
        400,
        "invalid_grant",
        "PKCE verification failed.",
      );
    }

    return claims;
  }

  async consume(code: string) {
    return this.redis.get<OAuthAuthorizationCodeClaims>(
      getOAuthAuthorizationCodeKey(code),
      { delete: true },
    );
  }
}

const authorizationCodeStore = new AuthorizationCodeStore();

export async function issueAuthorizationCode(params: {
  subject: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
}) {
  const claims = {
    sub: params.subject,
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    code_challenge: params.codeChallenge,
    code_challenge_method: OAUTH_CODE_CHALLENGE_METHOD,
  } satisfies OAuthAuthorizationCodeClaims;

  return authorizationCodeStore.issue(claims);
}

export async function compareAuthorizationCode(
  params: CompareAuthorizationCodeParams,
) {
  return authorizationCodeStore.compare(params);
}
