import type { RequestOptions } from "https";
import type { IncomingHttpHeaders } from "http";
import * as https from "https";
import * as crypto from "crypto";

import * as jws from "jws";
import forge from "node-forge";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ece from "http_ece";

function validateBase64UrlSafe(base64: string) {
  return /^[A-Za-z0-9\-_]+$/.test(base64);
}

type PushNotification = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
};

export const knownPushServicesRegex =
  /(^https:\/\/android\.googleapis\.com\/)|(^https:\/\/fcm\.googleapis\.com\/)|(^https:\/\/updates\.push\.services\.mozilla\.com\/)|(^https:\/\/updates-autopush\.stage\.mozaws\.net\/)|(^https:\/\/updates-autopush\.dev\.mozaws\.net\/)|(^https:\/\/[a-z0-9-]+\.notify\.windows\.com\/)|(^https:\/\/[a-z0-9-]+\.push\.apple\.com\/)/;

/* Default expiration in seconds */
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;

// Maximum expiration is 24 hours according. (See VAPID spec)
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;

// Default TTL is four weeks.
const DEFAULT_TTL = 2419200;

type SupportedContentEncoding = "aesgcm" | "aes128gcm";
const AES_GCM: SupportedContentEncoding = "aesgcm";
const AES_128_GCM: SupportedContentEncoding = "aes128gcm";

type Headers = Record<string, string>;

type RequestDetails = {
  method: string;
  headers: Headers;
  endpoint: string;
  body?: string;
  agent?: RequestOptions["agent"];
  timeout?: RequestOptions["timeout"];
};

type NotificationResponse = {
  statusCode?: number;
  body: string;
  headers: IncomingHttpHeaders;
};

type VapidDetails = {
  subject: string;
  publicKey: string;
  privateKey: string;
};

type PushRequestOptions = {
  vapidDetails: VapidDetails;
  contentEncoding?: SupportedContentEncoding;
  headers?: Headers;
  TTL?: number;
  agent?: RequestOptions["agent"];
  timeout?: RequestOptions["timeout"];
};

/**
 * To get the details of a request to trigger a push message, without sending
 * a push notification call this method.
 *
 * This method will throw an error if there is an issue with the input.
 * @param  {PushSubscription} subscription The PushSubscription you wish to send the notification to.
 * @param  {string|Buffer} payload       The payload you wish to send to the user.
 * @param  {Object} options       Options for the vapid keys can be passed in.
 * @return {Object}                        This method returns an Object which contains 'endpoint', 'method', 'headers' and 'payload'.
 */
function generateRequestDetails(
  subscription: PushNotification,
  payload: string | Buffer | null,
  options: PushRequestOptions
) {
  if (subscription.endpoint.length === 0) {
    throw new Error(
      "The subscription endpoint must be a string with a valid URL."
    );
  }

  if (!knownPushServicesRegex.test(subscription.endpoint)) {
    throw new Error("The subscription endpoint not a known endpoint.");
  }

  const currentVapidDetails = options.vapidDetails;
  const timeToLive = options.TTL ?? DEFAULT_TTL;
  const contentEncoding = options.contentEncoding ?? AES_128_GCM;

  if (timeToLive < 0) {
    throw new Error("TTL should be a number and should be at least 0");
  }

  let extraHeaders: Record<string, string> = {};
  if (options.headers) {
    extraHeaders = options.headers;
    const duplicates = Object.keys(extraHeaders).filter(
      (header) => header in options
    );

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicated headers defined [${duplicates.join(
          ","
        )}]. Please either define the header in thetop level options OR in the 'headers' key.`
      );
    }
  }

  const headers: RequestDetails["headers"] = {
    TTL: String(timeToLive),
  };
  Object.keys(extraHeaders).forEach((header) => {
    const value = extraHeaders[header];
    if (value) {
      headers[header] = value;
    }
  });
  let requestPayload = null;

  // Validate the subscription keys
  if (typeof subscription.keys !== "object") {
    throw new Error(
      "To send a message with a payload, the subscription must have 'auth' and 'p256dh' keys."
    );
  }

  const encrypted = encrypt(
    subscription.keys.auth,
    subscription.keys.p256dh,
    payload || "",
    contentEncoding
  );

  headers["Content-Length"] = encrypted.cipherText.length;
  headers["Content-Type"] = "application/octet-stream";

  if (contentEncoding === AES_128_GCM) {
    headers["Content-Encoding"] = AES_128_GCM;
  } else if (contentEncoding === AES_GCM) {
    headers["Content-Encoding"] = AES_GCM;
    headers.Encryption = `salt=${encrypted.salt}`;
    headers["Crypto-Key"] = `dh=${encrypted.localPublicKey.toString(
      "base64url"
    )}`;
  }

  requestPayload = encrypted.cipherText;

  const parsedUrl = new URL(subscription.endpoint);
  const audience = `${parsedUrl.protocol}//${parsedUrl.host}`;

  const vapidHeaders = getVapidHeaders(
    audience,
    currentVapidDetails.subject,
    currentVapidDetails.publicKey,
    currentVapidDetails.privateKey,
    contentEncoding
  );

  headers.Authorization = vapidHeaders.Authorization;

  if (contentEncoding === AES_GCM) {
    const keyValue = vapidHeaders["Crypto-Key"];
    if (keyValue) {
      if (headers["Crypto-Key"]) {
        headers["Crypto-Key"] += `;${keyValue}`;
      } else {
        headers["Crypto-Key"] = keyValue;
      }
    }
  }

  const requestDetails: RequestDetails = {
    method: "POST",
    headers: headers,
    endpoint: subscription.endpoint,
    body: requestPayload,
    agent: options.agent,
    timeout: options.timeout,
  };

  return requestDetails;
}

/**
 * To send a push notification call this method with a subscription, optional payload and any options.
 * @param  {PushSubscription} subscription The PushSubscription you wish to send the notification to.
 * @param  {string|Buffer} payload       The payload you wish to send to the user.
 * @param  {Object} options  Options for the vapid keys
 * @return {Promise}                       This method returns a Promise which resolves if the sending of the notification was successful, otherwise it rejects.
 */
export function sendWebPushNotification(
  subscription: PushNotification,
  payload: string | Buffer | null,
  options: PushRequestOptions
) {
  let requestDetails: RequestDetails;
  try {
    requestDetails = generateRequestDetails(subscription, payload, options);
  } catch (err) {
    return Promise.reject(err);
  }

  return new Promise<NotificationResponse>((resolve, reject) => {
    const httpsOptions: RequestOptions = {};

    httpsOptions.headers = requestDetails.headers;
    httpsOptions.method = requestDetails.method;

    if (requestDetails.timeout) {
      httpsOptions.timeout = requestDetails.timeout;
    }

    httpsOptions.agent = requestDetails.agent;

    const pushRequest = https.request(
      requestDetails.endpoint,
      httpsOptions,
      (pushResponse) => {
        let responseText = "";

        pushResponse.on("data", (chunk) => {
          responseText += chunk;
        });

        pushResponse.on("end", () => {
          if (
            pushResponse.statusCode &&
            (pushResponse.statusCode < 200 || pushResponse.statusCode > 299)
          ) {
            reject(
              new Error(
                "Received unexpected response code " +
                  pushResponse.statusCode +
                  " - " +
                  responseText
              )
            );
          } else {
            resolve({
              statusCode: pushResponse.statusCode,
              body: responseText,
              headers: pushResponse.headers,
            });
          }
        });
      }
    );

    if (requestDetails.timeout) {
      pushRequest.on("timeout", () => {
        pushRequest.destroy(new Error("Socket timeout"));
      });
    }

    pushRequest.on("error", (e) => {
      reject(e);
    });

    if (requestDetails.body) {
      pushRequest.write(requestDetails.body);
    }

    pushRequest.end();
  });
}

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
  if (!validateBase64UrlSafe(publicKey)) {
    throw new Error(
      'Vapid public key must be a URL safe Base 64 (without "=")'
    );
  }

  if (Buffer.from(publicKey, "base64url").length !== 65) {
    throw new Error("Vapid public key should be 65 bytes long when decoded.");
  }
}

function validatePrivateKey(privateKey: string) {
  if (!validateBase64UrlSafe(privateKey)) {
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
function getVapidHeaders(
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

function encrypt(
  userPublicKey: string,
  userAuth: string,
  payload: string | Buffer,
  contentEncoding?: string
) {
  if (Buffer.from(userPublicKey, "base64url").length !== 65) {
    throw new Error(
      "The subscription p256dh value should be exactly 65 bytes long."
    );
  }

  if (Buffer.from(userAuth, "base64url").length < 16) {
    throw new Error(
      "The subscription auth key should be at least 16 bytes long"
    );
  }

  if (typeof payload === "string") {
    payload = Buffer.from(payload);
  }

  const localCurve = crypto.createECDH("prime256v1");
  const localPublicKey = localCurve.generateKeys();

  const salt = Buffer.from(crypto.randomBytes(16)).toString("base64url");

  const cipherText = ece.encrypt(payload, {
    version: contentEncoding,
    dh: userPublicKey,
    privateKey: localCurve,
    salt: salt,
    authSecret: userAuth,
  });

  return {
    localPublicKey: localPublicKey,
    salt: salt,
    cipherText: cipherText,
  };
}
