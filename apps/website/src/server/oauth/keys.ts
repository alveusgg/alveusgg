import { createPrivateKey, createPublicKey } from "node:crypto";

import { env } from "@/env";

import { OAUTH_KID, OAUTH_SIGNING_ALG } from "./config";

export function hasOAuthSigningKey() {
  return Boolean(env.OAUTH_PRIVATE_KEY_PEM?.trim());
}

function getPrivateKeyPem() {
  const pem = env.OAUTH_PRIVATE_KEY_PEM;
  if (!pem) {
    throw new Error("OAUTH_PRIVATE_KEY_PEM is not configured.");
  }

  return pem
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\n/g, "\n");
}

export function getPrivateSigningKey() {
  return createPrivateKey(getPrivateKeyPem());
}

export function getPublicSigningKey() {
  return createPublicKey(getPrivateSigningKey());
}

export function getOAuthPublicJwk() {
  if (!OAUTH_KID) {
    throw new Error("OAUTH_KID is not configured.");
  }

  const jwk = getPublicSigningKey().export({ format: "jwk" });
  return {
    kty: jwk.kty,
    kid: OAUTH_KID,
    use: "sig",
    alg: OAUTH_SIGNING_ALG,
    n: jwk.n,
    e: jwk.e,
  };
}
