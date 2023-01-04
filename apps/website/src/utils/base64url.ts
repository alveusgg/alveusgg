export function isBase64UrlEncoded(base64: string) {
  return /^[A-Za-z0-9\-_]+$/.test(base64);
}

export function encode(src: Buffer) {
  return src.toString("base64url");
}

export function decode(src: string) {
  return Buffer.from(src, "base64url");
}
