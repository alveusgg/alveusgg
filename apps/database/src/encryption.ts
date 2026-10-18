/**
 * Field-level encryption for personal data and secrets stored in the database.
 *
 * Values are encrypted with AES-256-GCM and stored as `v2.<key id>.<base64url(iv | ciphertext | tag)>`.
 * - The key id allows rotating keys: the first key of the keyring encrypts, every key can decrypt.
 * - The model and field are bound to the ciphertext as additional authenticated data, so an
 *   encrypted value can't be moved to another column (e.g. given name <-> family name).
 *
 * Blind indexes are keyed hashes (HMAC-SHA-256) of normalized values. They let us look up or
 * enforce uniqueness on encrypted values (e.g. emails) without storing them in plain text.
 */
import type { webcrypto } from "node:crypto";

const VERSION = "v2";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

const KEYRING_ENTRY_PATTERN = /^([a-z0-9]{1,16}):(.+)$/;
// Reserve version prefixes independently of payload validity. Corrupted ciphertext and unknown
// versions must never be treated as plain text while migrating existing rows.
const ENCRYPTED_PREFIX_PATTERN = /^v[0-9]+\./;
const ENCRYPTED_VALUE_PATTERN = /^v2\.([a-z0-9]{1,16})\.([A-Za-z0-9_-]+)$/;

/** Length of a blind index (base64url of a SHA-256 HMAC), e.g. for `@db.Char(43)` columns */
export const BLIND_INDEX_LENGTH = 43;

type Key = webcrypto.CryptoKey;

export type EncryptionContext = {
  /** Prisma model name, e.g. `FormEntry` */
  model: string;
  /** Field name, e.g. `givenName` */
  field: string;
};

export type DecryptOptions = {
  /** Return plaintext during migration. Values starting with `v<number>.` are always reserved. */
  allowPlaintext?: boolean;
};

export type FieldEncryptionOptions = {
  /** Comma-separated list of `<key id>:<base64 32-byte key>`, the first key is used to encrypt */
  keys: string | undefined;
  /** Base64 32-byte key for blind indexes, only needed to create blind indexes */
  blindIndexKey?: string;
};

function decodeKey(key: string, name: string) {
  const bytes = Buffer.from(key, "base64");
  if (bytes.length !== KEY_LENGTH) {
    throw new Error(`${name} must be a base64 ${KEY_LENGTH}-byte key`);
  }
  return bytes;
}

/**
 * Parse a keyring definition (`<key id>:<base64 key>,...`), the first key is the active one.
 * Error messages never include key material.
 */
function parseKeyring(keys: string) {
  const entries = keys
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const keyring = new Map<string, Buffer>();
  for (const entry of entries) {
    const [, id, key] = KEYRING_ENTRY_PATTERN.exec(entry) ?? [];
    if (!id || !key) {
      throw new Error(
        "Encryption keys must be formatted as <key id>:<base64 key>, key ids may only contain a-z and 0-9",
      );
    }
    if (keyring.has(id)) {
      throw new Error(`Duplicate encryption key id ${id}`);
    }
    keyring.set(id, decodeKey(key, `Encryption key ${id}`));
  }

  const [activeKeyId] = keyring.keys();
  if (!activeKeyId) {
    throw new Error("No encryption keys configured");
  }
  return { activeKeyId, keyring };
}

function getAdditionalData(keyId: string, { model, field }: EncryptionContext) {
  return Buffer.from(`${VERSION}.${keyId}:${model}.${field}`);
}

/** Whether a value has an encryption version prefix. Does not validate or authenticate it. */
export function isEncrypted(value: string) {
  return ENCRYPTED_PREFIX_PATTERN.test(value);
}

/**
 * Create the encryption helpers for a keyring. The configuration is parsed lazily on first use,
 * so builds without secrets (e.g. `SKIP_ENV_VALIDATION`) don't fail at import time.
 */
export function createFieldEncryption(options: FieldEncryptionOptions) {
  let parsed: ReturnType<typeof parseKeyring> | undefined;
  const getKeyring = () => (parsed ??= parseKeyring(options.keys ?? ""));

  const keys = new Map<string, Promise<Key>>();
  const getKey = (keyId: string) => {
    let key = keys.get(keyId);
    if (!key) {
      const raw = getKeyring().keyring.get(keyId);
      if (!raw) {
        throw new Error(`Unknown encryption key id ${keyId}`);
      }

      key = crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
      ]);
      keys.set(keyId, key);
    }
    return key;
  };

  let blindIndexKey: Promise<Key> | undefined;
  const getBlindIndexKey = () => {
    if (!options.blindIndexKey) {
      throw new Error("Blind index key is not configured");
    }

    return (blindIndexKey ??= crypto.subtle.importKey(
      "raw",
      decodeKey(options.blindIndexKey, "Blind index key"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    ));
  };

  /** Encrypt a value for the given model field with the active key */
  async function encrypt(plaintext: string, context: EncryptionContext) {
    const { activeKeyId } = getKeyring();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: getAdditionalData(activeKeyId, context),
      },
      await getKey(activeKeyId),
      Buffer.from(plaintext),
    );

    const payload = Buffer.concat([iv, new Uint8Array(ciphertext)]);
    return `${VERSION}.${activeKeyId}.${payload.toString("base64url")}`;
  }

  /**
   * Decrypt a value of the given model field. Values without a version prefix are only accepted
   * with `allowPlaintext` (rows not migrated yet). Version-prefixed plaintext must be encrypted
   * directly, rather than passed through this migration fallback.
   */
  async function decrypt(
    value: string,
    context: EncryptionContext,
    { allowPlaintext = false }: DecryptOptions = {},
  ) {
    if (!isEncrypted(value)) {
      if (allowPlaintext) return value;
      throw new Error(`${context.model}.${context.field} is not encrypted`);
    }

    try {
      const [, keyId, payload] = ENCRYPTED_VALUE_PATTERN.exec(value) ?? [];
      if (!keyId || !payload) {
        throw new Error("Invalid or unsupported encrypted value format");
      }

      const bytes = Buffer.from(payload, "base64url");
      const plaintext = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: bytes.subarray(0, IV_LENGTH),
          additionalData: getAdditionalData(keyId, context),
        },
        await getKey(keyId),
        bytes.subarray(IV_LENGTH),
      );
      return Buffer.from(plaintext).toString();
    } catch (cause) {
      // Don't include the value, the error might end up in logs
      throw new Error(`Could not decrypt ${context.model}.${context.field}`, {
        cause,
      });
    }
  }

  /** Like {@link encrypt}, but passes `null` and `undefined` through */
  async function encryptOptional<T extends null | undefined>(
    plaintext: string | T,
    context: EncryptionContext,
  ) {
    return plaintext == null ? plaintext : encrypt(plaintext, context);
  }

  /** Like {@link decrypt}, but passes `null` and `undefined` through */
  async function decryptOptional<T extends null | undefined>(
    value: string | T,
    context: EncryptionContext,
    options?: DecryptOptions,
  ) {
    return value == null ? value : decrypt(value, context, options);
  }

  /** Whether a value isn't encrypted with the active key yet (for backfills and key rotation) */
  function needsReencryption(value: string) {
    const [, keyId] = ENCRYPTED_VALUE_PATTERN.exec(value) ?? [];
    return keyId !== getKeyring().activeKeyId;
  }

  /**
   * Keyed hash of a normalized value, to look up encrypted values without decrypting them.
   * The purpose keeps hashes of different kinds of values apart.
   */
  async function blindIndex(purpose: string, value: string) {
    const signature = await crypto.subtle.sign(
      "HMAC",
      await getBlindIndexKey(),
      Buffer.from(`${purpose}\0${value}`),
    );
    return Buffer.from(signature).toString("base64url");
  }

  /** Blind index of an email address, the same in every table that stores emails */
  function blindIndexEmail(email: string) {
    return blindIndex("email", email.trim().toLowerCase());
  }

  return {
    encrypt,
    decrypt,
    encryptOptional,
    decryptOptional,
    needsReencryption,
    blindIndexEmail,
  };
}
