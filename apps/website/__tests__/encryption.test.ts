import { expect, test, vi } from "vitest";
import {
  generateSalt,
  decodeSalt,
  encodeSalt,
  createSaltedEncryptionKey,
  encrypt,
  decrypt,
} from "@/server/utils/encryption";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {
      DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
    },
  };
});

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
  const salt = decodeSalt("PBgjVu4YvlyR1zvRXK2u2Q==");
  const encrypted = "OGWBKBR87FPiqMFckXnMXSq/9Al6IfNUSMRYuMdJU2CQ";

  const key = await createSaltedEncryptionKey(salt);
  expect(key).toBeDefined();

  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBeDefined();
  expect(decrypted).toEqual("hello");
});

test("decrypting empty value should not fail", async () => {
  let failed = false;
  let decrypted;
  try {
    const salt = decodeSalt("nqjSIYuP82Tle4YCJCelDg==");
    const encrypted = "";

    const key = await createSaltedEncryptionKey(salt);
    expect(key).toBeDefined();

    decrypted = await decrypt(encrypted, key);
  } catch (e) {
    failed = true;
  }

  expect(failed).toBe(false);
  expect(decrypted).toBe("");
});

test("decrypting empty value with allowEmpty=false should fail", async () => {
  await expect(async () => {
    const salt = decodeSalt("nqjSIYuP82Tle4YCJCelDg==");
    const encrypted = "";

    const key = await createSaltedEncryptionKey(salt);
    expect(key).toBeDefined();

    await decrypt(encrypted, key, { allowEmpty: false });
  }).rejects.toThrow();
});

test("decrypting with invalid salt should fail", async () => {
  await expect(async () => {
    const salt = decodeSalt("this is not correct");
    const encrypted = "zH9R26HtTiw/Tkbfc1ZLh44XxlMhwORBiHn2OG04zVuL";

    const key = await createSaltedEncryptionKey(salt);
    expect(key).toBeDefined();

    await decrypt(encrypted, key);
  }).rejects.toThrow();
});

test("decrypting with invalid encryption should fail", async () => {
  await expect(async () => {
    const salt = decodeSalt("nqjSIYuP82Tle4YCJCelDg==");
    const encrypted = "this should be encrypted";

    const key = await createSaltedEncryptionKey(salt);
    expect(key).toBeDefined();

    await decrypt(encrypted, key);
  }).rejects.toThrow();
});

test("encrypt/decrypt end-to-end", async () => {
  const key = await createSaltedEncryptionKey(await generateSalt());
  const decrypted = await decrypt(await encrypt("hello", key), key);
  expect(decrypted).toBeDefined();
  expect(decrypted).toEqual("hello");
});
