// @ts-check
import { z } from "zod";

/** @param {string} base64 */
function isBase64UrlEncoded(base64) {
  return /^[A-Za-z0-9\-_]+$/.test(base64);
}

/**
 * @param {string} str
 * @returns {string}
 */
export function decode(str) {
  return atob(str.replaceAll("-", "+").replaceAll("_", "/"));
}

/**
 * @param {string} subject
 * @param {import("zod").RefinementCtx} ctx
 * @returns {boolean}
 */
export function checkSubject(subject, ctx) {
  if (subject.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "The subject value must be a string containing a URL or mailto: address",
    });
    return false;
  }

  if (subject.indexOf("mailto:") !== 0) {
    try {
      const subjectParseResult = new URL(subject);
      if (!subjectParseResult.hostname) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vapid subject url is missing a hostname!",
        });
        return false;
      }
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vapid subject is not a valid url or mailto url!",
      });
      return false;
    }
  }

  return true;
}

/**
 * @param {string} base64
 * @param {import("zod").RefinementCtx} ctx
 * @returns {boolean}
 */
export function checkBase64UrlEncoded(base64, ctx) {
  if (!isBase64UrlEncoded(base64)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Value must be base64url",
    });
    return false;
  }

  return true;
}

/**
 * @param {string} publicKey
 * @param {import("zod").RefinementCtx} ctx
 * @returns {boolean}
 */
export function checkPublicKey(publicKey, ctx) {
  const len = decode(publicKey).length;
  if (len !== 65) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vapid public key should be 65 bytes long when decoded.",
    });
    return false;
  }

  return true;
}

/**
 * @param {string} privateKey
 * @param {import("zod").RefinementCtx} ctx
 * @returns {boolean}
 */
export function checkPrivateKey(privateKey, ctx) {
  const len = decode(privateKey).length;
  if (len !== 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vapid private key should be 32 bytes long when decoded.",
    });
    return false;
  }

  return true;
}
