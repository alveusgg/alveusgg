import * as jws from "jws";
import forge from "node-forge";

import { base64url } from "../base64url";

// Default expiration in seconds
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
// Maximum expiration is 24 hours according. (See VAPID spec)
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
export type SupportedContentEncoding = "aesgcm" | "aes128gcm";
export const AES_GCM: SupportedContentEncoding = "aesgcm";
export const AES_128_GCM: SupportedContentEncoding = "aes128gcm";

function toPEM(privateKey: string, publicKey: string) {
  let privateKeyBuffer = Buffer.from(privateKey, "base64url");
  let publicKeyBuffer = Buffer.from(publicKey, "base64url");

  // Occasionally the keys will not be padded to the correct length resulting
  // in errors, hence this padding.
  // See https://github.com/web-push-libs/web-push/issues/295 for history.
  const padding = Buffer.alloc(32 - privateKeyBuffer.length);
  padding.fill(0);
  privateKeyBuffer = Buffer.concat([padding, privateKeyBuffer]);

  const pubPadding = Buffer.alloc(66 - publicKeyBuffer.length);
  pubPadding.fill(0);
  publicKeyBuffer = Buffer.concat([pubPadding, publicKeyBuffer]);

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

function validateSubject(subject: string) {
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

function validatePublicKey(publicKey: string) {
  if (!base64url(publicKey)) {
    throw new Error(
      'Vapid public key must be a URL safe Base 64 (without "=")'
    );
  }

  if (Buffer.from(publicKey, "base64url").length !== 65) {
    throw new Error("Vapid public key should be 65 bytes long when decoded.");
  }
}

function validatePrivateKey(privateKey: string) {
  if (!base64url(privateKey)) {
    throw new Error(
      'Vapid private key must be a URL safe Base 64 (without "=")'
    );
  }

  if (Buffer.from(privateKey, "base64url").length !== 32) {
    throw new Error("Vapid private key should be 32 bytes long when decoded.");
  }
}

/**
 * Given the number of seconds calculates
 * the expiration in the future by adding the passed `numSeconds`
 * with the current seconds from Unix Epoch
 *
 * @param {Number} numSeconds Number of seconds to be added
 * @return {Number} Future expiration in seconds
 */
function getFutureExpirationTimestamp(numSeconds: number) {
  const futureExp = new Date();
  futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
  return Math.floor(futureExp.getTime() / 1000);
}

/**
 * Validates the Expiration Header based on the VAPID Spec
 * Throws error of type `Error` if the expiration is not validated
 *
 * @param {Number} expiration Expiration seconds from Epoch to be validated
 */
function validateExpiration(expiration: number) {
  if (!Number.isInteger(expiration)) {
    throw new Error("`expiration` value must be a number");
  }

  if (expiration < 0) {
    throw new Error("`expiration` must be a positive integer");
  }

  // Roughly checks the time of expiration, since the max expiration can be ahead
  // of the time than at the moment the expiration was generated
  const maxExpirationTimestamp = getFutureExpirationTimestamp(
    MAX_EXPIRATION_SECONDS
  );

  if (expiration >= maxExpirationTimestamp) {
    throw new Error("`expiration` value is greater than maximum of 24 hours");
  }
}

/**
 * This method takes the required VAPID parameters and returns the required
 * header to be added to a Web Push Protocol Request.
 * @param  {string} audience        This must be the origin of the push service.
 * @param  {string} subject         This should be a URL or a 'mailto:' email
 * address.
 * @param  {string} publicKey       The VAPID public key.
 * @param  {string} privateKey      The VAPID private key.
 * @param  {string} contentEncoding The contentEncoding type.
 * @param  {number} [expiration]    The expiration of the VAPID JWT (integer).
 * @return {Object}                 Returns an Object with the Authorization and
 * 'Crypto-Key' values to be used as headers.
 */
export function getVapidHeaders(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string,
  contentEncoding: string,
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

  validateSubject(subject);
  validatePublicKey(publicKey);
  validatePrivateKey(privateKey);

  if (expiration) {
    validateExpiration(expiration);
  } else {
    expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
  }

  const pem = toPEM(privateKey, publicKey);

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
    privateKey: pem,
  });

  if (contentEncoding === AES_128_GCM) {
    return {
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
    };
  }

  if (contentEncoding === AES_GCM) {
    return {
      Authorization: `WebPush ${jwt}`,
      "Crypto-Key": `p256ecdsa=${publicKey}`,
    };
  }

  throw new Error("Unsupported encoding type specified.");
}
