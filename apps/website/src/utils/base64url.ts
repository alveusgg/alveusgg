function base64ToArrayBuffer(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

export function base64toBase64Url(base64: string) {
  return base64.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
}

export function encodeArrayBufferToBase64Url(src: ArrayBuffer) {
  return base64toBase64Url(arrayBufferToBase64(src));
}

export function encodeBase64UrlString(str: string) {
  return base64toBase64Url(btoa(str));
}

export function base64toBase64URL(str: string) {
  return str.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
}

export function base64UrlToBase64(str: string) {
  return str.replaceAll("-", "+").replaceAll("_", "/");
}

export function decodeBase64UrlString(str: string) {
  return atob(base64UrlToBase64(str));
}

export function decodeBase64UrlToArrayBuffer(str: string) {
  return base64ToArrayBuffer(base64UrlToBase64(str));
}
