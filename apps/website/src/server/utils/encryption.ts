import { webcrypto as crypto } from "node:crypto";
import { env } from "@/env/server.mjs";

const KEY_ALGORITHM_NAME = "PBKDF2";
const ENCRYPTION_ALGORITHM_NAME = "AES-GCM";
const ENCRYPTION_ALGORITHM_LENGTH = 256;
const HASH_ALGORITHM_NAME = "SHA-256";
const HASH_ITERATIONS = 10_000;
const ENCRYPTION_PASSPHRASE_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64Encode(u8: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, u8 as unknown as Array<number>));
}

function base64Decode(str: string) {
  return new Uint8Array(
    atob(str)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
}

export async function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export function decodeSalt(salt: string) {
  return base64Decode(salt);
}

export function encodeSalt(salt: Uint8Array) {
  return base64Encode(salt);
}

async function importEncryptionKey(key: string) {
  const keyBuffer = encoder.encode(key);
  if (keyBuffer.length !== ENCRYPTION_PASSPHRASE_LENGTH)
    throw new Error("Invalid key length");

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: KEY_ALGORITHM_NAME },
    false,
    ["deriveKey"]
  );
}

export async function deriveSaltedEncryptionKey(
  key: CryptoKey,
  salt: ArrayBuffer
) {
  return crypto.subtle.deriveKey(
    {
      name: KEY_ALGORITHM_NAME,
      salt,
      iterations: HASH_ITERATIONS,
      hash: HASH_ALGORITHM_NAME,
    },
    key,
    { name: ENCRYPTION_ALGORITHM_NAME, length: ENCRYPTION_ALGORITHM_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function createSaltedEncryptionKey(salt: ArrayBuffer) {
  const dataEncryptionKey = await importEncryptionKey(
    env.DATA_ENCRYPTION_PASSPHRASE
  );
  return deriveSaltedEncryptionKey(dataEncryptionKey, salt);
}

export async function encrypt(
  plainText: string,
  saltedEncryptionKey: CryptoKey
) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plainTextBuffer = encoder.encode(plainText);

  const encryptedCipherTextBuffer = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM_NAME, iv, tagLength: 128 },
    saltedEncryptionKey,
    plainTextBuffer
  );

  const resultBuffer = new Uint8Array(
    iv.length + encryptedCipherTextBuffer.byteLength
  );
  resultBuffer.set(iv);
  resultBuffer.set(new Uint8Array(encryptedCipherTextBuffer), iv.length);

  return base64Encode(resultBuffer);
}

export async function decrypt(
  encryptedText: string,
  saltedEncryptionKey: CryptoKey,
  { allowEmpty = true } = {}
) {
  if (allowEmpty && encryptedText === "") {
    return "";
  }

  if (encryptedText.length <= IV_LENGTH + 1) {
    throw new Error("Invalid encryption");
  }

  const encryptedBuffer = base64Decode(encryptedText);

  const iv = encryptedBuffer.slice(0, IV_LENGTH);
  const cipherText = encryptedBuffer.slice(IV_LENGTH);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM_NAME, iv, tagLength: 128 },
      saltedEncryptionKey,
      cipherText
    );
    return decoder.decode(decryptedBuffer);
  } catch (e) {
    console.error(e);
    throw new Error("Could not decrypt"); // Re-throw with a more generic error message to avoid leaking information
  }
}
