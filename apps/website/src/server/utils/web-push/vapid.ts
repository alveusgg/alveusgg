import { webcrypto as crypto } from "node:crypto";

import { env } from "@/env/server.mjs";
import {
  decodeBase64UrlToArrayBuffer,
  encodeArrayBufferToBase64Url,
  encodeBase64UrlString,
} from "@/utils/base64url";

// Default expiration in seconds
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;

// Maximum expiration is 24 hours according to VAPID spec
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;

function getFutureTimestamp(seconds: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return Math.floor(date.getTime() / 1000);
}

function checkExpiration(expiration: number) {
  if (!Number.isInteger(expiration)) {
    throw new Error("`expiration` value must be a number");
  }

  if (expiration < 0) {
    throw new Error("`expiration` must be a positive integer");
  }

  const maxExpirationTimestamp = getFutureTimestamp(MAX_EXPIRATION_SECONDS);

  if (expiration >= maxExpirationTimestamp) {
    throw new Error("`expiration` value is greater than maximum of 24 hours");
  }
}

export async function createSignedJWT(payload: unknown) {
  const headerStr = encodeBase64UrlString(
    JSON.stringify({ typ: "JWT", alg: "ES256" })
  );
  const payloadStr = encodeBase64UrlString(JSON.stringify(payload));
  const unsignedToken = `${headerStr}.${payloadStr}`;

  const publicKey = env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("Vapid public key is not set.");

  const privateKey = env.WEB_PUSH_VAPID_PRIVATE_KEY;
  if (!privateKey) throw new Error("Vapid private key is not set.");

  const publicKeyBuffer = decodeBase64UrlToArrayBuffer(publicKey);

  const signingKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: encodeArrayBufferToBase64Url(publicKeyBuffer.subarray(1, 33)),
      y: encodeArrayBufferToBase64Url(publicKeyBuffer.subarray(33, 65)),
      d: privateKey,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    signingKey,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${encodeArrayBufferToBase64Url(signature)}`;
}

export async function getVapidAuthorizationString(
  audience: string,
  expiration?: number
) {
  if (audience.length === 0) {
    throw new Error(
      `The audience value must be a string containing the origin of a push service. ${audience}`
    );
  }

  const audienceParseResult = new URL(audience);
  if (!audienceParseResult.hostname) {
    throw new Error(`VAPID audience is not a url. ${audience}`);
  }

  const publicKey = env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("Vapid public key is not set.");

  const subject = env.WEB_PUSH_VAPID_SUBJECT;
  if (!subject) throw new Error("Vapid subject is not set.");

  if (expiration) {
    checkExpiration(expiration);
  } else {
    expiration = getFutureTimestamp(DEFAULT_EXPIRATION_SECONDS);
  }

  const jwt = await createSignedJWT({
    aud: audience,
    exp: expiration,
    sub: subject,
  });

  return `vapid t=${jwt}, k=${publicKey}`;
}
