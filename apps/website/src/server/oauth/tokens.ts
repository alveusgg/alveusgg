import { createSign, createVerify, randomUUID } from "node:crypto";

import { prisma } from "@alveusgg/database";

import { getRolesForUser, getTwitchUserId } from "@/server/db/users";

import {
  OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_ISSUER,
  OAUTH_KID,
  OAUTH_REFRESH_TOKEN_TTL_SECONDS,
  OAUTH_SIGNING_ALG,
} from "./config";
import { encodeBase64Url } from "./helper";
import { getPrivateSigningKey, getPublicSigningKey } from "./keys";

type OAuthJwtHeader = {
  alg: typeof OAUTH_SIGNING_ALG;
  kid: string;
  typ: "JWT";
};

type OAuthBaseClaims = {
  iss: string;
  sub: string;
  client_id: string;
  iat: number;
  exp: number;
  jti: string;
};

export type OAuthAccessTokenClaims = OAuthBaseClaims & {
  type: "access";
  roles: string[];
};

export type OAuthRefreshTokenClaims = OAuthBaseClaims & {
  type: "refresh";
};

type OAuthUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  roles: string[];
  twitchUserId?: string;
};

export class OAuthRequestError extends Error {
  readonly status: number;
  readonly error: string;

  constructor(status: number, error: string, message: string) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function decodeJwtPart<T>(input: string): T {
  return JSON.parse(decodeBase64Url(input)) as T;
}

function createJwtHeader(): OAuthJwtHeader {
  if (!OAUTH_KID) {
    throw new Error("OAUTH_KID is not configured.");
  }

  return {
    alg: OAUTH_SIGNING_ALG,
    kid: OAUTH_KID,
    typ: "JWT",
  };
}

function createBaseClaims(
  subject: string,
  clientId: string,
  lifetimeSeconds: number,
): OAuthBaseClaims {
  const iat = Math.floor(Date.now() / 1000);
  return {
    iss: OAUTH_ISSUER,
    sub: subject,
    client_id: clientId,
    iat,
    exp: iat + lifetimeSeconds,
    jti: randomUUID(),
  };
}

export function createOAuthBaseClaims(
  subject: string,
  clientId: string,
  lifetimeSeconds: number,
) {
  return createBaseClaims(subject, clientId, lifetimeSeconds);
}

export async function signOAuthTokenClaims(claims: Record<string, unknown>) {
  const encodedHeader = encodeBase64Url(JSON.stringify(createJwtHeader()));
  const encodedPayload = encodeBase64Url(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(getPrivateSigningKey());

  return `${unsignedToken}.${encodeBase64Url(signature)}`;
}

export async function verifyOAuthTokenClaims<T>(token: string): Promise<T> {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new OAuthRequestError(400, "invalid_grant", "Token is malformed.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new OAuthRequestError(400, "invalid_grant", "Token is malformed.");
  }

  let header: OAuthJwtHeader;
  let claims: T & Partial<OAuthBaseClaims>;

  try {
    header = decodeJwtPart<OAuthJwtHeader>(encodedHeader);
    claims = decodeJwtPart<T & Partial<OAuthBaseClaims>>(encodedPayload);
  } catch {
    throw new OAuthRequestError(400, "invalid_grant", "Token is malformed.");
  }

  if (
    header.alg !== OAUTH_SIGNING_ALG ||
    header.typ !== "JWT" ||
    header.kid !== OAUTH_KID
  ) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Token header is invalid.",
    );
  }

  const signature = Buffer.from(
    encodedSignature
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        encodedSignature.length + ((4 - (encodedSignature.length % 4)) % 4),
        "=",
      ),
    "base64",
  );
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();
  const isValid = verifier.verify(getPublicSigningKey(), signature);

  if (!isValid) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Token signature is invalid.",
    );
  }

  if (claims.iss !== OAUTH_ISSUER) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Token issuer is invalid.",
    );
  }

  if (
    typeof claims.exp !== "number" ||
    claims.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new OAuthRequestError(400, "invalid_grant", "Token has expired.");
  }

  return claims as T;
}

export async function issueAccessToken(params: {
  subject: string;
  clientId: string;
  roles: string[];
}) {
  return signOAuthTokenClaims({
    ...createBaseClaims(
      params.subject,
      params.clientId,
      OAUTH_ACCESS_TOKEN_TTL_SECONDS,
    ),
    type: "access",
    roles: params.roles,
  } satisfies OAuthAccessTokenClaims);
}

export async function issueAccessTokenForUser(params: {
  userId: string;
  clientId: string;
}) {
  const user = await getOAuthUser(params.userId);
  if (!user) {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "User is no longer available.",
    );
  }

  return issueAccessToken({
    subject: user.id,
    clientId: params.clientId,
    roles: user.roles,
  });
}

export async function verifyAccessToken(token: string) {
  const claims = await verifyOAuthTokenClaims<OAuthAccessTokenClaims>(token);
  if (claims.type !== "access") {
    throw new OAuthRequestError(
      401,
      "invalid_token",
      "Expected an access token.",
    );
  }
  return claims;
}

export async function issueRefreshToken(params: {
  subject: string;
  clientId: string;
}) {
  return signOAuthTokenClaims({
    ...createBaseClaims(
      params.subject,
      params.clientId,
      OAUTH_REFRESH_TOKEN_TTL_SECONDS,
    ),
    type: "refresh",
  } satisfies OAuthRefreshTokenClaims);
}

export async function verifyRefreshToken(token: string) {
  const claims = await verifyOAuthTokenClaims<OAuthRefreshTokenClaims>(token);
  if (claims.type !== "refresh") {
    throw new OAuthRequestError(
      400,
      "invalid_grant",
      "Expected a refresh token.",
    );
  }
  return claims;
}

export async function getOAuthUser(
  userId: string,
): Promise<OAuthUserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  const [roles, twitchUserId] = await Promise.all([
    getRolesForUser(user.id),
    getTwitchUserId(user.id),
  ]);

  return {
    ...user,
    roles,
    twitchUserId,
  };
}

export function getOAuthAccessTokenExpirySeconds() {
  return OAUTH_ACCESS_TOKEN_TTL_SECONDS;
}
