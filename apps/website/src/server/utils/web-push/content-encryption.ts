import type { ECDH } from "node:crypto";
import {
  createHmac,
  createCipheriv,
  createECDH,
  randomBytes,
} from "node:crypto";

import { decodeBase64UrlToArrayBuffer } from "@/utils/base64url";

export const PAD_SIZE = 1;
export const TAG_LENGTH = 16;
export const KEY_LENGTH = 16;
export const NONCE_LENGTH = 12;
export const SHA_256_LENGTH = 32;

type KeyAndNonce = {
  key: Buffer;
  nonce: Buffer;
};

export function HMAC_hash(key: Buffer, input: Buffer) {
  const hmac = createHmac("sha256", key);
  hmac.update(input);
  return hmac.digest();
}

export function HKDF_expand(
  pseudoRandomKey: Buffer,
  info: Buffer,
  length: number
) {
  const counterBuffer = Buffer.alloc(1);

  let output = Buffer.alloc(0);
  let T = Buffer.alloc(0);
  let counter = 0;
  while (output.length < length) {
    counterBuffer.writeUIntBE(++counter, 0, 1);
    T = HMAC_hash(pseudoRandomKey, Buffer.concat([T, info, counterBuffer]));
    output = Buffer.concat([output, T]);
  }

  return output.slice(0, length);
}

export function HKDF(
  salt: Buffer,
  inputKeyMaterial: Buffer,
  info: Buffer,
  length: number
) {
  return HKDF_expand(HMAC_hash(salt, inputKeyMaterial), info, length);
}

export function deriveKeyAndNonce(params: {
  salt: Buffer;
  authSecret: Buffer;
  dh: Buffer;
  localKeypair: ECDH;
}): KeyAndNonce {
  const secret = HKDF(
    params.authSecret,
    params.localKeypair.computeSecret(params.dh),
    Buffer.concat([
      Buffer.from("WebPush: info\0"),
      params.dh,
      params.localKeypair.getPublicKey(),
    ]),
    SHA_256_LENGTH
  );
  const pseudoRandomKey = HMAC_hash(params.salt, secret);
  return {
    key: HKDF_expand(
      pseudoRandomKey,
      Buffer.from("Content-Encoding: aes128gcm\0"),
      KEY_LENGTH
    ),
    nonce: HKDF_expand(
      pseudoRandomKey,
      Buffer.from("Content-Encoding: nonce\0"),
      NONCE_LENGTH
    ),
  };
}

export function generateNonce(base: Buffer, counter: number) {
  const nonce = Buffer.from(base);
  const m = nonce.readUIntBE(nonce.length - 6, 6);
  const x =
    ((m ^ counter) & 0xffffff) +
    (((m / 0x1000000) ^ (counter / 0x1000000)) & 0xffffff) * 0x1000000;
  nonce.writeUIntBE(x, nonce.length - 6, 6);
  return nonce;
}

export function encryptRecord(
  key: KeyAndNonce,
  counter: number,
  buffer: Buffer,
  pad = 0,
  last = false
) {
  pad = pad || 0;
  const nonce = generateNonce(key.nonce, counter);
  const gcm = createCipheriv("aes-128-gcm", key.key, nonce);

  const ciphertext = [];
  const padding = Buffer.alloc(pad + PAD_SIZE);
  padding.fill(0);

  ciphertext.push(gcm.update(buffer));
  padding.writeUIntBE(last ? 2 : 1, 0, 1);
  ciphertext.push(gcm.update(padding));

  gcm.final();
  const tag = gcm.getAuthTag();
  if (tag.length !== TAG_LENGTH) {
    throw new Error("invalid tag generated");
  }
  ciphertext.push(tag);
  return Buffer.concat(ciphertext);
}

export function writeHeader(keyId: Buffer, rs: number, salt: Buffer) {
  const ints = Buffer.alloc(5);
  ints.writeUIntBE(rs, 0, 4);
  ints.writeUIntBE(keyId.length, 4, 1);
  return Buffer.concat([salt, ints, keyId]);
}

export function createCipherText(
  localPublicKey: Buffer,
  salt: Buffer,
  payload: Buffer,
  key: KeyAndNonce
) {
  const overhead = PAD_SIZE + TAG_LENGTH;
  const rs = 4096;

  let cipherText = writeHeader(localPublicKey, rs, salt);
  let start = 0;
  let pad = 0;
  let counter = 0;
  let last = false;
  while (!last) {
    // Pad so that at least one data byte is in a block.
    let recordPad = Math.min(rs - overhead - 1, pad);
    if (pad > 0 && recordPad === 0) {
      recordPad += 1; // Deal with perverse case of rs=overhead+1 with padding.
    }
    pad -= recordPad;

    const end = start + rs - overhead - recordPad;
    last = end >= payload.length;
    last = last && pad <= 0;
    const block = encryptRecord(
      key,
      counter,
      payload.subarray(start, end),
      recordPad,
      last
    );
    cipherText = Buffer.concat([cipherText, block]);

    start = end;
    ++counter;
  }

  return cipherText;
}

export function encryptContent(
  userPublicKey: string,
  userPrivateKey: string,
  payload: Buffer
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

  const localKeypair = createECDH("prime256v1");
  const localPublicKey = localKeypair.generateKeys();
  const salt = Buffer.from(randomBytes(16));
  const key = deriveKeyAndNonce({
    salt,
    localKeypair,
    dh: Buffer.from(dh),
    authSecret: Buffer.from(authSecret),
  });

  return createCipherText(localPublicKey, salt, payload, key);
}
