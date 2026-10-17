/**
 * Field-level encryption for personal data and secrets stored in the database.
 *
 * Values are encrypted with AES-256-GCM and stored as `v2.<key id>.<base64url(iv | ciphertext | tag)>`.
 * - The key id allows rotating keys: the first key of the keyring encrypts, every key can decrypt.
 * - The model and field are bound to the ciphertext as additional authenticated data, so an
 *   encrypted value can't be moved to another column (e.g. given name <-> family name).
 * - Values written by the previous helpers (v1: PBKDF2-derived key per record, `salt` column)
 *   can still be decrypted with the legacy passphrase.
 *
 * Blind indexes are keyed hashes (HMAC-SHA-256) of normalized values. They let us look up or
 * enforce uniqueness on encrypted values (e.g. emails) without storing them in plain text.
 *
 * Only uses Web Crypto, so it works in Node.js, Next.js and Cloudflare Workers alike.
 */

const VERSION = "v2";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

const KEY_ID_PATTERN = /^[a-z0-9]{1,16}$/;
// Reserve version prefixes independently of payload validity. Corrupted ciphertext and unknown
// versions must never be treated as plain text while migrating existing rows.
const ENCRYPTED_PREFIX_PATTERN = /^v[0-9]+\./;
const ENCRYPTED_VALUE_PATTERN = /^v2\.([a-z0-9]{1,16})\.([A-Za-z0-9_-]*)$/;

const LEGACY_KEY_LENGTH = 32;
const LEGACY_HASH_ITERATIONS = 10_000;

/** Length of a blind index (base64url of a SHA-256 HMAC), e.g. for `@db.Char(43)` columns */
export const BLIND_INDEX_LENGTH = 43;

// The package has no DOM types and Node's `CryptoKey` is only declared as a value
type Key = Awaited<ReturnType<typeof crypto.subtle.importKey>>;

const encoder = new TextEncoder();
// A leading U+FEFF is part of the stored value, not a byte-order marker to strip.
const decoder = new TextDecoder("utf-8", { ignoreBOM: true });

export type EncryptionContext = {
  /** Prisma model name, e.g. `FormEntry` */
  model: string;
  /** Field name, e.g. `givenName` */
  field: string;
};

export type DecryptOptions = {
  /** Salt of the record for v1 values; null/undefined means no legacy decryption */
  legacySalt?: string | null;
  /** Return plaintext during migration. Values starting with `v<number>.` are always reserved. */
  allowPlaintext?: boolean;
};

export type FieldEncryptionOptions = {
  /** Comma-separated list of `<key id>:<base64 32-byte key>`, the first key is used to encrypt */
  keys: string;
  /** Base64 32-byte key for blind indexes, only needed to create blind indexes */
  blindIndexKey?: string;
  /** Passphrase used by the v1 helpers, only needed to decrypt values with a legacy salt */
  legacyPassphrase?: string;
};

function bytesToBase64(bytes: Uint8Array) {
  // Convert in chunks, spreading large arrays into fromCharCode exceeds the call stack
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(str: string) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(str: string) {
  return base64ToBytes(str.replace(/-/g, "+").replace(/_/g, "/"));
}

function decodeKey(key: string, name: string) {
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = base64ToBytes(key.trim());
  } catch {
    throw new Error(`${name} is not valid base64`);
  }

  if (bytes.length !== KEY_LENGTH) {
    throw new Error(`${name} must be ${KEY_LENGTH} bytes`);
  }

  return bytes;
}

/**
 * Parse a keyring definition (`<key id>:<base64 key>,...`), the first key is the active one.
 * Error messages never include key material.
 */
export function parseKeyring(keys: string) {
  const entries = keys
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (entries.length === 0) {
    throw new Error("No encryption keys configured");
  }

  let activeKeyId: string | undefined;
  const keyring = new Map<string, Uint8Array<ArrayBuffer>>();
  for (const entry of entries) {
    const separator = entry.indexOf(":");
    const id = entry.slice(0, Math.max(separator, 0));
    if (!KEY_ID_PATTERN.test(id)) {
      throw new Error(
        "Encryption keys must be formatted as <key id>:<base64 key>, key ids may only contain a-z and 0-9",
      );
    }
    if (keyring.has(id)) {
      throw new Error(`Duplicate encryption key id ${id}`);
    }

    keyring.set(
      id,
      decodeKey(entry.slice(separator + 1), `Encryption key ${id}`),
    );
    activeKeyId ??= id;
  }

  return { activeKeyId: activeKeyId!, keyring };
}

function getAdditionalData(keyId: string, { model, field }: EncryptionContext) {
  return encoder.encode(`${VERSION}.${keyId}:${model}.${field}`);
}

/** Whether a value has an encryption version prefix. Does not validate or authenticate it. */
export function isEncrypted(value: string) {
  return ENCRYPTED_PREFIX_PATTERN.test(value);
}

/** Normalize an email address before creating a blind index for it */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export type FieldEncryption = ReturnType<typeof createFieldEncryption>;

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

  const legacyKeys = new Map<string, Promise<Key>>();
  const getLegacyKey = (salt: string) => {
    let key = legacyKeys.get(salt);
    if (!key) {
      const passphrase = encoder.encode(options.legacyPassphrase ?? "");
      if (passphrase.length !== LEGACY_KEY_LENGTH) {
        throw new Error("Legacy encryption passphrase is not configured");
      }

      key = crypto.subtle
        .importKey("raw", passphrase, { name: "PBKDF2" }, false, ["deriveKey"])
        .then((baseKey) =>
          crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt: base64ToBytes(salt),
              iterations: LEGACY_HASH_ITERATIONS,
              hash: "SHA-256",
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"],
          ),
        );
      // Every record has its own salt, so only keep the key while decrypting its fields
      legacyKeys.clear();
      legacyKeys.set(salt, key);
    }
    return key;
  };

  async function decryptLegacy(
    value: string,
    salt: string,
    context: EncryptionContext,
  ) {
    // The v1 helpers stored anonymized values as empty strings
    if (value === "") return "";

    try {
      const bytes = base64ToBytes(value);
      if (bytes.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error("Value is too short");
      }

      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: bytes.subarray(0, IV_LENGTH) },
        await getLegacyKey(salt),
        bytes.subarray(IV_LENGTH),
      );
      return decoder.decode(plaintext);
    } catch (cause) {
      throw new Error(
        `Could not decrypt legacy ${context.model}.${context.field}`,
        { cause },
      );
    }
  }

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
      encoder.encode(plaintext),
    );

    const payload = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
    payload.set(iv);
    payload.set(new Uint8Array(ciphertext), IV_LENGTH);
    return `${VERSION}.${activeKeyId}.${bytesToBase64Url(payload)}`;
  }

  /**
   * Decrypt a value of the given model field. Values without a version prefix are only accepted
   * with a `legacySalt` (v1 helpers) or `allowPlaintext` (rows not migrated yet). Version-prefixed
   * plaintext must be encrypted directly, rather than passed through this migration fallback.
   */
  async function decrypt(
    value: string,
    context: EncryptionContext,
    { legacySalt, allowPlaintext = false }: DecryptOptions = {},
  ) {
    const match = ENCRYPTED_VALUE_PATTERN.exec(value);
    if (!match) {
      if (isEncrypted(value)) {
        throw new Error(`Could not decrypt ${context.model}.${context.field}`, {
          cause: new Error("Invalid or unsupported encrypted value format"),
        });
      }
      if (legacySalt != null) return decryptLegacy(value, legacySalt, context);
      if (allowPlaintext) return value;
      throw new Error(`${context.model}.${context.field} is not encrypted`);
    }

    const keyId = match[1]!;
    const payload = match[2]!;
    const key = await getKey(keyId);
    try {
      const bytes = base64UrlToBytes(payload);
      if (bytes.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error("Value is too short");
      }

      const plaintext = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: bytes.subarray(0, IV_LENGTH),
          additionalData: getAdditionalData(keyId, context),
        },
        key,
        bytes.subarray(IV_LENGTH),
      );
      return decoder.decode(plaintext);
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
    const match = ENCRYPTED_VALUE_PATTERN.exec(value);
    return !match || match[1] !== getKeyring().activeKeyId;
  }

  /**
   * Keyed hash of a (normalized) value, to look up encrypted values without decrypting them.
   * The purpose separates hashes of different kinds of values, use the same purpose for values
   * that should match across tables (e.g. `email`).
   */
  async function blindIndex(purpose: string, value: string) {
    const signature = await crypto.subtle.sign(
      "HMAC",
      await getBlindIndexKey(),
      encoder.encode(`${purpose}\0${value}`),
    );
    return bytesToBase64Url(new Uint8Array(signature));
  }

  /** Blind index of an email address, shared by all tables that store emails */
  function blindIndexEmail(email: string) {
    return blindIndex("email", normalizeEmail(email));
  }

  return {
    encrypt,
    decrypt,
    encryptOptional,
    decryptOptional,
    needsReencryption,
    blindIndex,
    blindIndexEmail,
    isEncrypted,
    get activeKeyId() {
      return getKeyring().activeKeyId;
    },
  };
}
