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

export function toUint8Array(binaryStr: string) {
  const uint8Array = new Uint8Array(binaryStr.length);
  for (let s = 0, sl = binaryStr.length; s < sl; s++) {
    uint8Array[s] = binaryStr.charCodeAt(s);
  }
  return uint8Array;
}

const signAlgorithm = {
  name: "HMAC",
  hash: { name: "SHA-512" },
};

export async function sign(payload: unknown) {
  const payloadString =
    encodeBase64UrlString(
      JSON.stringify({
        typ: "JWT",
        alg: "ES256",
      })
    ) +
    "." +
    encodeBase64UrlString(JSON.stringify(payload));

  const privateKey = env.WEB_PUSH_VAPID_PRIVATE_KEY;
  if (!privateKey) throw new Error("Vapid private key is not set.");

  const buffer = toUint8Array(payloadString);
  const signingKey = await crypto.subtle.importKey(
    "raw",
    decodeBase64UrlToArrayBuffer(privateKey),
    signAlgorithm,
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(signAlgorithm, signingKey, buffer);

  return `${payloadString}.${encodeArrayBufferToBase64Url(signature)}`;
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

  const jwt = await sign({
    aud: audience,
    exp: expiration,
    sub: subject,
  });

  return `vapid t=${jwt}, k=${publicKey}`;
}
