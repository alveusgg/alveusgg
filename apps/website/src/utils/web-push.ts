import type { RequestOptions } from "https";
import * as https from "https";
import type { IncomingHttpHeaders } from "http";

import { knownPushServicesRegex } from "./web-push/known-push-services";
import type { SupportedContentEncoding } from "./web-push/vapid";
import { AES_128_GCM, AES_GCM, getVapidHeaders } from "./web-push/vapid";
import { encryptContent } from "./web-push/content-encryption";

type PushNotification = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
};

// Default TTL is four weeks.
const DEFAULT_TTL = 2419200;

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

  const encrypted = encryptContent(
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
