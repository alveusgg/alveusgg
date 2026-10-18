import { describe, expect, test } from "vitest";

import {
  BLIND_INDEX_LENGTH,
  createFieldEncryption,
  isEncrypted,
} from "@alveusgg/database/encryption";

const key1 = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";
const key2 = "ZmVkY2JhOTg3NjU0MzIxMGZlZGNiYTk4NzY1NDMyMTA=";
const blindIndexKey = "YmxpbmQtaW5kZXgta2V5LWZvci10ZXN0cy0xMjM0NTY=";

const encryption = createFieldEncryption({
  keys: `k1:${key1}`,
  blindIndexKey,
});

const givenName = { model: "FormEntry", field: "givenName" };
const familyName = { model: "FormEntry", field: "familyName" };

describe("encrypt/decrypt", () => {
  test("round trip", async () => {
    for (const value of ["John Doe", "", "Jürgen 🦊", "﻿﻿John"]) {
      const encrypted = await encryption.encrypt(value, givenName);
      expect(encrypted).toMatch(/^v2\.k1\.[A-Za-z0-9_-]+$/);
      expect(await encryption.decrypt(encrypted, givenName)).toBe(value);
    }
  });

  test("uses a random IV", async () => {
    expect(await encryption.encrypt("John", givenName)).not.toBe(
      await encryption.encrypt("John", givenName),
    );
  });

  test("value is bound to its model field", async () => {
    const encrypted = await encryption.encrypt("secret@example.com", givenName);
    // The error doesn't include the value, it might end up in logs
    await expect(encryption.decrypt(encrypted, familyName)).rejects.toThrow(
      /^Could not decrypt FormEntry\.familyName$/,
    );
    await expect(
      encryption.decrypt(encrypted, { model: "User", field: "givenName" }),
    ).rejects.toThrow("Could not decrypt User.givenName");
  });

  test("plaintext is only returned when allowed", async () => {
    await expect(encryption.decrypt("John", givenName)).rejects.toThrow(
      "FormEntry.givenName is not encrypted",
    );
    for (const value of ["John", "john@example.com", "v2john@example.com"]) {
      expect(isEncrypted(value)).toBe(false);
      expect(
        await encryption.decrypt(value, givenName, { allowPlaintext: true }),
      ).toBe(value);
    }
  });

  test("broken encrypted values never pass as plaintext", async () => {
    const encrypted = await encryption.encrypt("john@example.com", givenName);
    for (const value of [
      encrypted.slice(0, -1),
      encrypted.slice(0, 20),
      "v2.k1.",
      encrypted + "\n",
      encrypted.replace("v2.k1.", "v2.K1."),
      encrypted.replace("v2.", "v3."),
      // Known plaintext like this has to be passed to encrypt directly
      "v2.k1.john@example.com",
    ]) {
      expect(isEncrypted(value)).toBe(true);
      await expect(
        encryption.decrypt(value, givenName, { allowPlaintext: true }),
      ).rejects.toThrow("Could not decrypt FormEntry.givenName");
    }
  });
});

describe("key rotation", () => {
  test("old keys still decrypt, the first key encrypts", async () => {
    const encrypted = await encryption.encrypt("John", givenName);

    const rotated = createFieldEncryption({ keys: `k2:${key2},k1:${key1}` });
    expect(await rotated.decrypt(encrypted, givenName)).toBe("John");
    expect(rotated.needsReencryption(encrypted)).toBe(true);
    expect(rotated.needsReencryption("John")).toBe(true);

    const reencrypted = await rotated.encrypt("John", givenName);
    expect(reencrypted).toMatch(/^v2\.k2\./);
    expect(rotated.needsReencryption(reencrypted)).toBe(false);
  });

  test("values can't be decrypted without their key", async () => {
    const encrypted = await encryption.encrypt("John", givenName);

    const removed = createFieldEncryption({ keys: `k2:${key2}` });
    await expect(removed.decrypt(encrypted, givenName)).rejects.toMatchObject({
      message: "Could not decrypt FormEntry.givenName",
      cause: { message: "Unknown encryption key id k1" },
    });

    // The key id is authenticated as well, so a key can't be renamed
    const renamed = createFieldEncryption({ keys: `k9:${key1}` });
    await expect(
      renamed.decrypt(encrypted.replace("v2.k1.", "v2.k9."), givenName),
    ).rejects.toThrow("Could not decrypt FormEntry.givenName");
  });
});

describe("blind index", () => {
  test("is a keyed hash of the normalized email", async () => {
    const index = await encryption.blindIndexEmail("john@example.com");
    expect(index).toHaveLength(BLIND_INDEX_LENGTH);
    expect(await encryption.blindIndexEmail("  John@Example.COM ")).toBe(index);

    const otherKey = createFieldEncryption({
      keys: `k1:${key1}`,
      blindIndexKey: key2,
    });
    expect(await otherKey.blindIndexEmail("john@example.com")).not.toBe(index);
  });
});

describe("configuration", () => {
  test("is only checked when used", async () => {
    // Builds without secrets (SKIP_ENV_VALIDATION) still create the helpers
    const missing = createFieldEncryption({ keys: "", blindIndexKey: "" });
    await expect(missing.encrypt("John", givenName)).rejects.toThrow(
      "No encryption keys configured",
    );
    await expect(missing.blindIndexEmail("john@example.com")).rejects.toThrow(
      "Blind index key is not configured",
    );
  });

  test.each([
    [key1, "<key id>:<base64 key>"],
    [`K1:${key1}`, "<key id>:<base64 key>"],
    [`k1:${key1},k1:${key2}`, "Duplicate encryption key id k1"],
    [
      `k1:${key1.slice(0, -4)}`,
      "Encryption key k1 must be a base64 32-byte key",
    ],
  ])("rejects the keys %j", async (keys, message) => {
    await expect(
      createFieldEncryption({ keys }).encrypt("John", givenName),
    ).rejects.toThrow(message);
  });
});
