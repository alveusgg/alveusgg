import * as jws from "jws";
import forge from "node-forge";

import { isBase64UrlEncoded, decode } from "../base64url";

// Default expiration in seconds
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;

// Maximum expiration is 24 hours according to VAPID spec
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;

function padKeyBuffer(privateKeyBuffer: Buffer, size: number) {
  const padding = Buffer.alloc(size - privateKeyBuffer.length);
  padding.fill(0);
  return Buffer.concat([padding, privateKeyBuffer]);
}

function toPEM(privateKey: string, publicKey: string) {
  const privateKeyBuffer = padKeyBuffer(decode(privateKey), 32);
  const publicKeyBuffer = padKeyBuffer(decode(publicKey), 66);

  const oidAsn = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.OID,
    false,
    forge.asn1.oidToDer("1.2.840.10045.3.1.7").getBytes()
  );
  const keyAsn = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.SEQUENCE,
    true,
    [
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.INTEGER,
        false,
        "1"
      ),
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.OCTETSTRING,
        false,
        privateKeyBuffer.toString("binary")
      ),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 0, true, [oidAsn]),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 1, true, [
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.BITSTRING,
          false,
          publicKeyBuffer.toString("binary")
        ),
      ]),
    ]
  );

  return (
    forge.pem.encode({
      type: "EC PARAMETERS",
      body: forge.asn1.toDer(oidAsn).getBytes(),
    }) +
    forge.pem.encode({
      type: "EC PRIVATE KEY",
      body: forge.asn1.toDer(keyAsn).getBytes(),
    })
  );
}

function checkSubject(subject: string) {
  if (subject.length === 0) {
    throw new Error(
      `The subject value must be a string containing a URL or mailto: address. ${subject}`
    );
  }

  if (subject.indexOf("mailto:") !== 0) {
    const subjectParseResult = new URL(subject);
    if (!subjectParseResult.hostname) {
      throw new Error(`Vapid subject is not a url or mailto url. ${subject}`);
    }
  }
}

function checkPublicKey(publicKey: string) {
  if (!isBase64UrlEncoded(publicKey)) {
    throw new Error("Vapid public key must be base64url");
  }

  if (decode(publicKey).length !== 65) {
    throw new Error("Vapid public key should be 65 bytes long when decoded.");
  }
}

function checkPrivateKey(privateKey: string) {
  if (!isBase64UrlEncoded(privateKey)) {
    throw new Error("Vapid private key must be base64url");
  }

  if (decode(privateKey).length !== 32) {
    throw new Error("Vapid private key should be 32 bytes long when decoded.");
  }
}

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

export function getVapidAuthorizationString(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string,
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

  checkSubject(subject);
  checkPublicKey(publicKey);
  checkPrivateKey(privateKey);

  if (expiration) {
    checkExpiration(expiration);
  } else {
    expiration = getFutureTimestamp(DEFAULT_EXPIRATION_SECONDS);
  }

  const jwt = jws.sign({
    header: {
      typ: "JWT",
      alg: "ES256",
    },
    payload: {
      aud: audience,
      exp: expiration,
      sub: subject,
    },
    privateKey: toPEM(privateKey, publicKey),
  });

  return `vapid t=${jwt}, k=${publicKey}`;
}
