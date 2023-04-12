import { expect, test } from "vitest";
import {
  generateSalt,
  decodeSalt,
  encodeSalt,
  createSaltedEncryptionKey,
  encrypt,
  decrypt,
} from "@/server/utils/encryption";

test("generate salt", async () => {
  const salt = await generateSalt();
  expect(salt).toBeDefined();
});

test("encode/decode salt", async () => {
  const salt = await generateSalt();
  expect(salt).toBeDefined();

  const saltStr = encodeSalt(salt);
  expect(salt).not.toEqual(saltStr);
  const res = decodeSalt(saltStr);
  expect(salt).toEqual(res);
});

test("generate key", async () => {
  const salt = await generateSalt();
  expect(salt).toBeDefined();

  const key = await createSaltedEncryptionKey(salt);
  expect(key).toBeDefined();
});

test("encrypt", async () => {
  const salt = await generateSalt();
  expect(salt).toBeDefined();

  const key = await createSaltedEncryptionKey(salt);
  expect(key).toBeDefined();

  const encrypted = await encrypt("hello", key);
  expect(encrypted).toBeDefined();
  expect(encrypted).not.toEqual("hello");
});

test("decrypt", async () => {
  const salt = decodeSalt("nqjSIYuP82Tle4YCJCelDg==");
  const encrypted = "zH9R26HtTiw/Tkbfc1ZLh44XxlMhwORBiHn2OG04zVuL";

  const key = await createSaltedEncryptionKey(salt);
  expect(key).toBeDefined();

  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBeDefined();
  expect(decrypted).toEqual("hello");
});

test("encrypt/decrypt end-to-end", async () => {
  const key = await createSaltedEncryptionKey(await generateSalt());
  const decrypted = await decrypt(await encrypt("hello", key), key);
  expect(decrypted).toBeDefined();
  expect(decrypted).toEqual("hello");
});
