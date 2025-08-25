export const createJWT = (
  headers: Record<string, string>,
  data: Record<string, unknown>,
) => {
  return `${objectToBase64url(headers)}.${objectToBase64url(data)}`;
};

export const signJWT = async (token: string, jwkKey: string) => {
  const encoder = new TextEncoder();
  const jwk = JSON.parse(atob(jwkKey));

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(token),
  );

  return `${token}.${arrayBufferToBase64Url(new Uint8Array(signature))}`;
};

const arrayBufferToBase64Url = (buffer: Uint8Array<ArrayBuffer>) => {
  return btoa(String.fromCharCode(...buffer))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const objectToBase64url = (payload: unknown) => {
  return arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
};
