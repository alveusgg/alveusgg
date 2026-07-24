export function encodeBase64Url(input: string | Uint8Array<ArrayBufferLike>) {
  const buffer =
    typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buffer.toString("base64url");
}

export async function createPkceS256Challenge(codeVerifier: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return encodeBase64Url(new Uint8Array(digest));
}
