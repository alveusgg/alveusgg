import { webcrypto as crypto } from "node:crypto";

import { decodeBase64UrlToArrayBuffer } from "@/utils/base64url";
import {
  concatArrayBuffers,
  createUintArrayBEFromNumber,
  readNumberFromUintArrayBE,
} from "@/utils/array-buffer";

export const PAD_SIZE = 1;
export const TAG_LENGTH = 16;
export const KEY_LENGTH = 16;
export const NONCE_LENGTH = 12;
export const SHA_256_LENGTH = 32;

type KeyAndNonce = {
  key: ArrayBuffer;
  nonce: ArrayBuffer;
};

export async function computeSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
) {
  return crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    256
  );
}

export async function HMAC_hash(key: ArrayBuffer, input: ArrayBuffer) {
  return crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    ),
    input
  );
}

export async function HKDF_expand(
  pseudoRandomKey: ArrayBuffer,
  info: ArrayBuffer,
  length: number
) {
  const counterBuffer = new Uint8Array(1);

  let output = new ArrayBuffer(0);
  let lastHash = new ArrayBuffer(0);
  let counter = 0;
  while (output.byteLength < length) {
    counterBuffer[0] = ++counter;
    const input = concatArrayBuffers([lastHash, info, counterBuffer]);
    const hash = await HMAC_hash(pseudoRandomKey, input);
    output = concatArrayBuffers([output, hash]);
    lastHash = hash;
  }

  return output.slice(0, length);
}

export async function deriveHmacKey(
  salt: ArrayBuffer,
  inputKeyMaterial: ArrayBuffer,
  info: ArrayBuffer,
  length: number
) {
  const pseudoRandomKey = await HMAC_hash(salt, inputKeyMaterial);
  return HKDF_expand(pseudoRandomKey, info, length);
}

export async function deriveKeyAndNonce(params: {
  salt: ArrayBuffer;
  authSecret: ArrayBuffer;
  dh: ArrayBuffer;
  localKeypair: { privateKey: CryptoKey; publicKey: CryptoKey };
}): Promise<KeyAndNonce> {
  const userPublicKey = await crypto.subtle.importKey(
    "raw",
    params.dh,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  const secret = await deriveHmacKey(
    params.authSecret,
    await computeSecret(params.localKeypair.privateKey, userPublicKey),
    concatArrayBuffers([
      new TextEncoder().encode("WebPush: info\0"),
      params.dh,
      await crypto.subtle.exportKey("raw", params.localKeypair.publicKey),
    ]),
    SHA_256_LENGTH
  );

  const pseudoRandomKey = await HMAC_hash(params.salt, secret);
  return {
    key: await HKDF_expand(
      pseudoRandomKey,
      new TextEncoder().encode("Content-Encoding: aes128gcm\0"),
      KEY_LENGTH
    ),
    nonce: await HKDF_expand(
      pseudoRandomKey,
      new TextEncoder().encode("Content-Encoding: nonce\0"),
      NONCE_LENGTH
    ),
  };
}

export function generateNonce(base: ArrayBuffer, counter: number) {
  const nonce = new Uint8Array(base);
  const m = readNumberFromUintArrayBE(nonce.slice(nonce.length - 6));
  const x =
    ((m ^ counter) & 0xffffff) +
    (((m / 0x1000000) ^ (counter / 0x1000000)) & 0xffffff) * 0x1000000;

  nonce.set(createUintArrayBEFromNumber(x, 6), nonce.length - 6);
  return nonce;
}

export async function encryptRecord(
  keyAndNonce: KeyAndNonce,
  counter: number,
  buffer: ArrayBuffer,
  pad = 0,
  last = false
) {
  pad = pad || 0;
  const iv = generateNonce(keyAndNonce.nonce, counter);

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keyAndNonce.key,
    {
      name: "AES-GCM",
      length: 128,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const padding = new Uint8Array(pad + PAD_SIZE);
  padding.fill(0);
  const paddingBuffer = padding.buffer;
  new DataView(paddingBuffer).setUint8(0, last ? 2 : 1);

  return crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    concatArrayBuffers([buffer, paddingBuffer])
  );
}

export function createCipherHeader(keyId: ArrayBuffer, recordSize: number) {
  const sizes = new ArrayBuffer(5);
  const dv = new DataView(sizes);
  dv.setUint32(0, recordSize, false);
  dv.setUint8(4, keyId.byteLength);
  return [sizes, keyId];
}

export async function createCipherText(
  localPublicKey: CryptoKey,
  salt: Uint8Array,
  payload: Uint8Array,
  keyAndNonce: KeyAndNonce
) {
  const overhead = PAD_SIZE + TAG_LENGTH;
  const recordSize = 4096;

  const publicKeyBuffer = await crypto.subtle.exportKey("raw", localPublicKey);

  const buffers: Array<ArrayBuffer> = [
    salt.buffer,
    ...createCipherHeader(publicKeyBuffer, recordSize),
  ];

  let start = 0;
  let pad = 0;
  let counter = 0;
  while (true) {
    // Pad so that at least one data byte is in a block.
    let recordPad = Math.min(recordSize - overhead - 1, pad);
    if (pad > 0 && recordPad === 0) {
      recordPad += 1; // Deal with perverse case of rs=overhead+1 with padding.
    }
    pad -= recordPad;

    const end = start + recordSize - overhead - recordPad;
    const isLast = end >= payload.length && pad <= 0;
    buffers.push(
      await encryptRecord(
        keyAndNonce,
        counter++,
        payload.subarray(start, end),
        recordPad,
        isLast
      )
    );

    if (isLast) break;

    start = end;
  }

  console.log({ buffers });

  return concatArrayBuffers(buffers);
}

export async function encryptContent(
  userPublicKey: string,
  userPrivateKey: string,
  payload: Uint8Array
) {
  const dh = decodeBase64UrlToArrayBuffer(userPublicKey);
  if (dh.length !== 65) {
    throw new Error(
      "The subscription p256dh value should be exactly 65 bytes long."
    );
  }

  const authSecret = decodeBase64UrlToArrayBuffer(userPrivateKey);
  if (authSecret.length < 16) {
    throw new Error(
      "The subscription auth key should be at least 16 bytes long"
    );
  }

  const localKeypair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyAndNonce = await deriveKeyAndNonce({
    salt,
    localKeypair,
    dh,
    authSecret,
  });

  return createCipherText(localKeypair.publicKey, salt, payload, keyAndNonce);
}
