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
 * @type {import("zod/v4/core").CheckFn<string>}
 */
export function checkSubject(ctx) {
  if (ctx.value.length === 0) {
    ctx.issues.push({
      code: "custom",
      message:
        "The subject value must be a string containing a URL or mailto: address",
      input: ctx.value,
    });
    return;
  }

  if (ctx.value.indexOf("mailto:") !== 0) {
    try {
      const subjectParseResult = new URL(ctx.value);
      if (!subjectParseResult.hostname) {
        ctx.issues.push({
          code: "custom",
          message: "Vapid subject url is missing a hostname!",
          input: ctx.value,
        });
        return;
      }
    } catch (_) {
      ctx.issues.push({
        code: "custom",
        message: "Vapid subject is not a valid url or mailto url!",
        input: ctx.value,
      });
      return;
    }
  }
}

/**
 * @type {import("zod/v4/core").CheckFn<string>}
 */
export function checkBase64UrlEncoded(ctx) {
  if (!isBase64UrlEncoded(ctx.value)) {
    ctx.issues.push({
      code: "custom",
      message: "Value must be base64url",
      input: ctx.value,
    });
    return;
  }
}

/**
 * @type {import("zod/v4/core").CheckFn<string>}
 */
export function checkPublicKey(ctx) {
  const len = decode(ctx.value).length;
  if (len !== 65) {
    ctx.issues.push({
      code: "custom",
      message: "Vapid public key should be 65 bytes long when decoded.",
      input: ctx.value,
    });
    return;
  }
}

/**
 * @type {import("zod/v4/core").CheckFn<string>}
 */
export function checkPrivateKey(ctx) {
  const len = decode(ctx.value).length;
  if (len !== 32) {
    ctx.issues.push({
      code: "custom",
      message: "Vapid private key should be 32 bytes long when decoded.",
      input: ctx.value,
    });
    return;
  }
}
