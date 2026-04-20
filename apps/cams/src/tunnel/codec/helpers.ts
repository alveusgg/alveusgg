import {
  base64ToBytes,
  bytesToBase64,
  readBodyToBytes,
  type SerialisedBody,
} from "./platform";

export function decodeBody(body: SerialisedBody): BodyInit | null {
  if (body === null) return null;
  if (typeof body === "string") return body;
  // `Uint8Array` is a valid `BodyInit` at runtime, but the DOM lib types
  // haven't caught up yet; cast through `unknown`.
  return base64ToBytes(body[1]) as unknown as BodyInit;
}

export async function encodeBody(
  body: ReadableStream<Uint8Array> | null,
): Promise<SerialisedBody> {
  if (body === null) return null;
  const bytes = await readBodyToBytes(body);
  return ["bytes", bytesToBase64(bytes)];
}
