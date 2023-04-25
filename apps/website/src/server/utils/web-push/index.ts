import { knownPushServicesRegex } from "./known-push-services";
import { getVapidAuthorizationString } from "./vapid";
import { encryptContent } from "./content-encryption";
import type { WebPushHttpsRequestOptions } from "./https-transport";
import { requestHttps } from "./https-transport";

type PushNotificationBase64Url = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
};

type AdditionalHeaderName =
  | "Topic"
  | "Urgency"
  | Exclude<
      string,
      | "TTL"
      | "Content-Length"
      | "Content-Type"
      | "Content-Encoding"
      | "Authorization"
    >;

type PushRequestOptions = {
  vapidDetails: {
    subject: string;
    publicKey: string;
    privateKey: string;
  };
  headers?: Record<AdditionalHeaderName, string>;
  TTL?: number;
};

type HttpsPushRequestOptions = PushRequestOptions &
  Pick<WebPushHttpsRequestOptions, "agent" | "timeout">;

const DEFAULT_TTL = 4 * 7 * 24 * 60 * 60; // seconds

function generateRequestDetails(
  subscription: PushNotificationBase64Url,
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

  if (timeToLive < 0) {
    throw new Error("TTL should be a number and should be at least 0");
  }

  // Validate the subscription keys
  if (typeof subscription.keys !== "object") {
    throw new Error(
      "To send a message with a payload, the subscription must have 'auth' and 'p256dh' keys."
    );
  }

  const url = new URL(subscription.endpoint);
  const body = encryptContent(
    subscription.keys.auth,
    subscription.keys.p256dh,
    Buffer.from(payload || "")
  ).cipherText;

  return {
    endpoint: subscription.endpoint,
    headers: {
      ...options.headers,
      TTL: String(timeToLive),
      "Content-Length": String(body.length),
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: getVapidAuthorizationString(
        `${url.protocol}//${url.host}`,
        currentVapidDetails.subject,
        currentVapidDetails.publicKey,
        currentVapidDetails.privateKey
      ),
    },
    body: body,
  };
}

export async function sendWebPushNotification(
  subscription: PushNotificationBase64Url,
  payload: string | Buffer | null,
  options: HttpsPushRequestOptions
) {
  const { endpoint, body, headers } = generateRequestDetails(
    subscription,
    payload,
    options
  );

  // TODO: Support fetch instead of node https?
  return await requestHttps(endpoint, body, {
    headers: headers,
    timeout: options.timeout,
    agent: options.agent,
  });
}
