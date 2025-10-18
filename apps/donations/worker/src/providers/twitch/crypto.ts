import {
  TwitchEventHubMessageIdHeader,
  TwitchEventHubMessageSignatureHeader,
  TwitchEventHubMessageTimestampHeader,
} from "./const";

export async function createSignatureFromRequest(
  request: Request,
  secret: string,
) {
  const scratch = request.clone();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const body = await scratch.text();
  const message = [
    scratch.headers.get(TwitchEventHubMessageIdHeader),
    scratch.headers.get(TwitchEventHubMessageTimestampHeader),
    body,
  ].join("");

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return `sha256=${arrayBufferToHex(signature)}`;
}

export function arrayBufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySignature(request: Request, secret: string) {
  const signature = await createSignatureFromRequest(request, secret);
  const expectedSignature = request.headers.get(
    TwitchEventHubMessageSignatureHeader,
  );
  return signature === expectedSignature;
}
