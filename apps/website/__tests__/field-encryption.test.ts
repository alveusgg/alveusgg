import { describe, expect, test } from "vitest";

import {
  BLIND_INDEX_LENGTH,
  createFieldEncryption,
  isEncrypted,
  normalizeEmail,
  parseKeyring,
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
    const encrypted = await encryption.encrypt("John Doe", givenName);
    expect(encrypted).toMatch(/^v2\.k1\.[A-Za-z0-9_-]+$/);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(await encryption.decrypt(encrypted, givenName)).toBe("John Doe");
  });

  test("empty and unicode values", async () => {
    for (const value of [
      "",
      "Jürgen 🦊",
      "\uFEFFJohn",
      "\uFEFF\uFEFFJohn",
      "a".repeat(1_000_000),
    ]) {
      const encrypted = await encryption.encrypt(value, givenName);
      expect(await encryption.decrypt(encrypted, givenName)).toBe(value);
    }
  });

  test("uses a random IV", async () => {
    const a = await encryption.encrypt("John", givenName);
    const b = await encryption.encrypt("John", givenName);
    expect(a).not.toBe(b);
  });

  test("value is bound to its model field", async () => {
    const encrypted = await encryption.encrypt("John", givenName);
    await expect(encryption.decrypt(encrypted, familyName)).rejects.toThrow(
      "Could not decrypt FormEntry.familyName",
    );
    await expect(
      encryption.decrypt(encrypted, { model: "User", field: "givenName" }),
    ).rejects.toThrow();
  });

  test("tampered values fail", async () => {
    const encrypted = await encryption.encrypt("John", givenName);
    // Change a character in the middle (the last one might only hold padding bits)
    const i = Math.floor(encrypted.length / 2);
    const tampered =
      encrypted.slice(0, i) +
      (encrypted[i] === "A" ? "B" : "A") +
      encrypted.slice(i + 1);
    await expect(encryption.decrypt(tampered, givenName)).rejects.toThrow(
      "Could not decrypt",
    );
  });

  test("error does not contain the value", async () => {
    const encrypted = await encryption.encrypt("secret@example.com", givenName);
    const error = await encryption
      .decrypt(encrypted, familyName)
      .catch((e: unknown) => e as Error);
    expect(String(error)).not.toContain("secret");
    expect(String(error)).not.toContain(encrypted);
  });

  test("plaintext is rejected unless allowed", async () => {
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

  test("malformed encrypted values fail instead of passing as plaintext", async () => {
    const encrypted = await encryption.encrypt("john@example.com", givenName);
    for (const malformed of [
      encrypted.slice(0, -1),
      encrypted.slice(0, 20),
      "v2.",
      "v2.k1",
      "v2.k1.",
      encrypted + "!",
      encrypted + "=",
      encrypted + "\n",
      encrypted.replace("v2.k1.", "v2.K1."),
      encrypted.replace("v2.", "v3."),
    ]) {
      expect(isEncrypted(malformed)).toBe(true);
      await expect(
        encryption.decrypt(malformed, givenName, { allowPlaintext: true }),
      ).rejects.toThrow("Could not decrypt");
    }
  });

  test("version prefixes are reserved even in plaintext migration mode", async () => {
    const value = "v2.k1.john@example.com";
    await expect(
      encryption.decrypt(value, givenName, { allowPlaintext: true }),
    ).rejects.toThrow("Could not decrypt");

    // Known plaintext can always be encrypted directly, including prefix-like values.
    const encrypted = await encryption.encrypt(value, givenName);
    expect(await encryption.decrypt(encrypted, givenName)).toBe(value);
  });

  test("optional values pass null and undefined through", async () => {
    expect(await encryption.encryptOptional(null, givenName)).toBeNull();
    expect(await encryption.encryptOptional(undefined, givenName)).toBe(
      undefined,
    );
    expect(await encryption.decryptOptional(null, givenName)).toBeNull();

    const encrypted = await encryption.encryptOptional("John", givenName);
    expect(await encryption.decryptOptional(encrypted, givenName)).toBe("John");
  });
});

describe("key rotation", () => {
  test("old keys still decrypt, the first key encrypts", async () => {
    const encrypted = await encryption.encrypt("John", givenName);

    const rotated = createFieldEncryption({
      keys: `k2:${key2},k1:${key1}`,
      blindIndexKey,
    });
    expect(rotated.activeKeyId).toBe("k2");
    expect(await rotated.decrypt(encrypted, givenName)).toBe("John");
    expect(rotated.needsReencryption(encrypted)).toBe(true);

    const reencrypted = await rotated.encrypt("John", givenName);
    expect(reencrypted.startsWith("v2.k2.")).toBe(true);
    expect(rotated.needsReencryption(reencrypted)).toBe(false);
    expect(rotated.needsReencryption("John")).toBe(true);
  });

  test("unknown key ids fail", async () => {
    const other = createFieldEncryption({ keys: `k2:${key2}`, blindIndexKey });
    const encrypted = await encryption.encrypt("John", givenName);
    await expect(other.decrypt(encrypted, givenName)).rejects.toThrow(
      "Unknown encryption key id k1",
    );
  });

  test("same key under another id fails", async () => {
    const renamed = createFieldEncryption({
      keys: `k9:${key1}`,
      blindIndexKey,
    });
    const encrypted = await encryption.encrypt("John", givenName);
    await expect(
      renamed.decrypt(encrypted.replace("v2.k1.", "v2.k9."), givenName),
    ).rejects.toThrow("Could not decrypt");
  });
});

describe("blind index", () => {
  test("is deterministic and keyed", async () => {
    const a = await encryption.blindIndex("email", "john@example.com");
    expect(a).toHaveLength(BLIND_INDEX_LENGTH);
    expect(await encryption.blindIndex("email", "john@example.com")).toBe(a);
    expect(await encryption.blindIndex("name", "john@example.com")).not.toBe(a);

    const otherKey = createFieldEncryption({
      keys: `k1:${key1}`,
      blindIndexKey: key2,
    });
    expect(await otherKey.blindIndex("email", "john@example.com")).not.toBe(a);
  });

  test("emails are normalized", async () => {
    expect(normalizeEmail("  John@Example.COM ")).toBe("john@example.com");
    expect(await encryption.blindIndexEmail("  John@Example.COM ")).toBe(
      await encryption.blindIndexEmail("john@example.com"),
    );
  });

  test("is not a plain hash of the value", async () => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("john@example.com"),
    );
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const index = await encryption.blindIndexEmail("john@example.com");
    expect(index).not.toBe(hex);
    expect(index).not.toBe(Buffer.from(digest).toString("base64url"));
  });
});

describe("configuration", () => {
  test("parses keyrings", () => {
    const { activeKeyId, keyring } = parseKeyring(` k2:${key2} , k1:${key1} `);
    expect(activeKeyId).toBe("k2");
    expect([...keyring.keys()]).toEqual(["k2", "k1"]);
  });

  test.each([
    ["", "No encryption keys configured"],
    [key1, "<key id>:<base64 key>"],
    [`K1:${key1}`, "<key id>:<base64 key>"],
    [`k1:${key1},k1:${key2}`, "Duplicate encryption key id k1"],
    ["k1:not base64!", "Encryption key k1 is not valid base64"],
    ["k1:c2hvcnQ=", "Encryption key k1 must be 32 bytes"],
  ])("rejects %j", (keys, message) => {
    expect(() => parseKeyring(keys)).toThrow(message);
  });

  test("errors don't contain key material", () => {
    const error = (() => {
      try {
        parseKeyring(`k1:${key1.slice(0, -4)}`);
      } catch (e) {
        return e as Error;
      }
    })();
    expect(error?.message).toBe("Encryption key k1 must be 32 bytes");
  });

  test("invalid configuration only fails when used", async () => {
    const invalid = createFieldEncryption({ keys: "", blindIndexKey: "" });
    await expect(invalid.encrypt("John", givenName)).rejects.toThrow(
      "No encryption keys configured",
    );
    await expect(invalid.blindIndex("email", "john")).rejects.toThrow(
      "Blind index key is not configured",
    );

    const shortKey = createFieldEncryption({
      keys: `k1:${key1}`,
      blindIndexKey: "c2hvcnQ=",
    });
    await expect(shortKey.blindIndex("email", "john")).rejects.toThrow(
      "Blind index key must be 32 bytes",
    );
  });
});
