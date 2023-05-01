import { webcrypto as crypto } from "node:crypto";
import { expect, test, vi } from "vitest";

import {
  decodeBase64UrlToArrayBuffer,
  encodeArrayBufferToBase64Url,
} from "@/utils/base64url";
import { concatArrayBuffers } from "@/utils/array-buffer";
import {
  HMAC_hash,
  HKDF_expand,
  SHA_256_LENGTH,
  deriveKeyAndNonce,
  encryptContent,
  createCipherHeader,
  createCipherText,
} from "@/server/utils/web-push/content-encryption";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {},
  };
});

const salt = new TextEncoder().encode("3208123h08dsf9pn");
const data = new TextEncoder().encode("this is some data");

const keyAndNonce = {
  key: new Uint8Array([
    250, 13, 71, 104, 127, 97, 86, 238, 51, 137, 76, 33, 207, 208, 201, 190,
  ]).buffer,
  nonce: new Uint8Array([90, 84, 77, 229, 216, 154, 30, 104, 88, 243, 51, 68])
    .buffer,
};

const publicKey = await crypto.subtle.importKey(
  "raw",
  new Uint8Array([
    4, 8, 20, 141, 180, 101, 141, 238, 108, 162, 141, 227, 138, 164, 158, 27, 0,
    237, 185, 41, 207, 192, 9, 235, 225, 215, 140, 165, 109, 52, 199, 185, 202,
    86, 81, 48, 83, 187, 141, 196, 243, 232, 241, 239, 155, 93, 230, 44, 235,
    117, 113, 115, 183, 205, 68, 234, 248, 116, 34, 206, 201, 198, 169, 68, 47,
  ]),
  { name: "ECDH", namedCurve: "P-256" },
  true,
  []
);

const authSecretStr = "ZFO3cPjB3ehHtfmB3Tdv7Q";
const dhStr =
  "BI4D-BjQz3_y_zHW4EWD90DZRe9W1hiSrlaKIRpUzlhzyVZOH9OHowPju78y424Cdwz2hJ5qNTxEzZBVsVbduYI";

test("HMAC_hash", async () => {
  const res = await HMAC_hash(salt, data);
  expect(res).toStrictEqual(
    new Uint8Array([
      216, 235, 41, 61, 107, 42, 177, 75, 117, 28, 251, 147, 128, 3, 248, 166,
      72, 193, 230, 216, 45, 129, 220, 131, 200, 140, 186, 187, 250, 211, 158,
      187,
    ]).buffer
  );
});

test("HKDF_expand", async () => {
  const res = await HKDF_expand(salt, data, SHA_256_LENGTH);
  expect(res).toStrictEqual(
    new Uint8Array([
      29, 219, 22, 29, 64, 36, 132, 133, 194, 12, 161, 243, 182, 128, 234, 166,
      248, 94, 218, 7, 194, 237, 24, 0, 138, 253, 71, 128, 108, 85, 174, 150,
    ]).buffer
  );
});

test("HKDF_expand 512", async () => {
  const res = await HKDF_expand(salt, data, 512);
  expect(res).toStrictEqual(
    new Uint8Array([
      29, 219, 22, 29, 64, 36, 132, 133, 194, 12, 161, 243, 182, 128, 234, 166,
      248, 94, 218, 7, 194, 237, 24, 0, 138, 253, 71, 128, 108, 85, 174, 150,
      28, 8, 75, 105, 151, 34, 49, 79, 139, 149, 247, 66, 229, 132, 180, 252,
      125, 214, 57, 154, 98, 247, 236, 25, 131, 148, 58, 148, 89, 7, 175, 91,
      207, 48, 63, 254, 243, 72, 143, 31, 30, 247, 38, 35, 8, 117, 47, 160, 99,
      150, 146, 222, 137, 126, 127, 249, 148, 123, 249, 176, 190, 124, 143, 1,
      157, 240, 12, 53, 251, 6, 62, 242, 215, 187, 233, 111, 88, 251, 64, 110,
      131, 216, 58, 142, 230, 76, 69, 94, 40, 135, 58, 55, 13, 125, 200, 147,
      77, 232, 132, 12, 202, 36, 109, 75, 69, 96, 175, 110, 208, 223, 143, 5,
      163, 231, 174, 170, 158, 137, 181, 197, 61, 236, 66, 74, 111, 96, 107,
      220, 195, 210, 121, 52, 213, 68, 53, 224, 6, 182, 83, 194, 101, 127, 10,
      105, 24, 175, 127, 45, 122, 235, 209, 192, 58, 70, 150, 128, 225, 121,
      192, 131, 3, 17, 229, 180, 241, 30, 129, 37, 106, 88, 50, 249, 170, 104,
      68, 189, 151, 89, 92, 19, 83, 235, 134, 94, 84, 54, 96, 245, 45, 217, 217,
      132, 172, 143, 155, 225, 27, 105, 74, 45, 182, 47, 217, 127, 146, 194,
      214, 176, 72, 186, 13, 36, 112, 151, 122, 213, 150, 199, 141, 136, 104,
      226, 119, 104, 56, 195, 178, 158, 229, 18, 222, 93, 136, 61, 187, 12, 138,
      151, 231, 214, 36, 131, 179, 24, 49, 147, 36, 201, 42, 35, 167, 103, 138,
      189, 1, 187, 3, 42, 69, 81, 26, 55, 128, 59, 207, 211, 221, 111, 81, 26,
      14, 208, 212, 20, 72, 21, 189, 65, 138, 188, 135, 156, 180, 61, 62, 41,
      53, 206, 45, 14, 107, 198, 136, 19, 246, 174, 4, 90, 2, 180, 183, 131,
      205, 182, 205, 160, 169, 60, 111, 36, 244, 182, 239, 39, 178, 232, 56,
      233, 213, 76, 147, 162, 190, 43, 3, 254, 90, 161, 52, 140, 185, 44, 213,
      76, 186, 234, 100, 16, 201, 164, 84, 245, 177, 97, 117, 254, 53, 168, 182,
      111, 168, 4, 35, 21, 205, 141, 61, 46, 66, 117, 3, 31, 133, 168, 145, 241,
      244, 162, 240, 253, 183, 242, 37, 236, 84, 109, 168, 198, 185, 236, 205,
      22, 180, 222, 198, 105, 110, 72, 198, 96, 72, 84, 181, 2, 73, 139, 116,
      20, 166, 55, 165, 206, 85, 180, 249, 237, 94, 195, 71, 99, 147, 110, 78,
      155, 200, 221, 47, 170, 55, 60, 80, 128, 182, 192, 161, 242, 73, 132, 221,
      32, 159, 138, 233, 37, 159, 236, 109, 38, 32, 106, 175, 221, 100, 183, 26,
      146, 176, 205, 194, 164, 58, 194, 89, 75, 29, 215, 111, 182, 45, 115, 80,
      0, 87, 181, 236, 127, 191, 207, 226, 99, 114, 27, 139, 118, 59, 36, 245,
      216, 174, 193,
    ]).buffer
  );
});

test("createCipherText", async () => {
  const cipherText = await createCipherText(publicKey, salt, data, keyAndNonce);

  const cipherSalt = cipherText.slice(0, 16);
  const recordSize = cipherText.slice(16, 20);
  const keySize = cipherText.slice(20, 21);
  const cipherPublicKey = cipherText.slice(21, 86);
  const encryptedPayload = cipherText.slice(86);

  const reportedRecordSize = new DataView(recordSize).getUint32(0, false);

  expect(cipherSalt).toStrictEqual(salt.buffer);
  expect(reportedRecordSize).toStrictEqual(4096);
  expect(new DataView(keySize).getUint8(0)).toStrictEqual(65);
  expect(cipherPublicKey).toStrictEqual(
    await crypto.subtle.exportKey("raw", publicKey)
  );

  expect(encryptedPayload).toStrictEqual(
    new Uint8Array([
      194, 161, 48, 26, 136, 212, 214, 181, 135, 157, 215, 73, 165, 30, 103,
      137, 222, 49, 30, 65, 137, 74, 51, 24, 73, 157, 214, 13, 159, 174, 90, 26,
      136, 226,
    ]).buffer
  );
});

test("encryptContent", async () => {
  const cipherText = await encryptContent(
    dhStr,
    authSecretStr,
    new TextEncoder().encode("hello world")
  );

  expect(cipherText).toBeDefined();
});

test("writeHeader", () => {
  const publicKeyBuffer = new TextEncoder().encode("Hallo");
  const res = createCipherHeader(publicKeyBuffer, 4096);

  expect(concatArrayBuffers(res)).toStrictEqual(
    new Uint8Array([0, 0, 16, 0, 5, 72, 97, 108, 108, 111]).buffer
  );
});

test("deriveNonce", async () => {
  const authSecret = decodeBase64UrlToArrayBuffer(authSecretStr);
  const dh = decodeBase64UrlToArrayBuffer(dhStr);
  const publicKeyBuffer = decodeBase64UrlToArrayBuffer(
    "BOUkJH3aWWO-FB6boIyhErhknl48pmFvz3Pd7sWGHi81SUQYjV38xVLy4XFARBAO7za4dtU1oGbbSEgdI70mUbg"
  );
  const localKeypair = {
    publicKey: await crypto.subtle.importKey(
      "raw",
      publicKeyBuffer,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    ),
    privateKey: await crypto.subtle.importKey(
      "jwk",
      {
        kty: "EC",
        crv: "P-256",
        x: encodeArrayBufferToBase64Url(publicKeyBuffer.subarray(1, 33)),
        y: encodeArrayBufferToBase64Url(publicKeyBuffer.subarray(33, 65)),
        d: "4rVU9zZHMXO9dYJ4i45Xodx8TyOH-BP4iAE-aDZwRww",
      },
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey", "deriveBits"]
    ),
  } as unknown as CryptoKeyPair;

  const { key, nonce } = await deriveKeyAndNonce({
    salt,
    localKeypair,
    dh,
    authSecret,
  });

  expect(key).toBeDefined();
  expect(key.byteLength).toBe(16);

  expect(nonce).toBeDefined();
  expect(nonce.byteLength).toBe(12);
  expect(encodeArrayBufferToBase64Url(nonce)).toStrictEqual("918asD7dErSAm32n");
});
