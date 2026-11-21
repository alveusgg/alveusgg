import { isEncrypted } from "@alveusgg/database/encryption";

import {
  createSaltedEncryptionKey,
  decodeSalt,
  decrypt as decryptV1,
} from "@/server/utils/encryption";
import { fieldEncryption } from "@/server/utils/field-encryption";

const entryContext = (field: string) => ({ model: "FormEntry", field });
const addressContext = (field: string) => ({ model: "MailingAddress", field });

export const mailingAddressFields = [
  "addressLine1",
  "addressLine2",
  "postalCode",
  "city",
  "state",
  "country",
] as const;

type EntryFields = Record<"givenName" | "familyName", string>;
type AddressFields = Record<(typeof mailingAddressFields)[number], string>;

// Anonymized entries have their values replaced with an empty string
const ANONYMIZED = "";

async function encryptValue(
  value: string,
  context: { model: string; field: string },
) {
  return value === ANONYMIZED
    ? ANONYMIZED
    : fieldEncryption.encrypt(value, context);
}

// The v1 helpers derived one key per row from its salt.
// TODO(201-cleanup): remove with server/utils/encryption.ts and the salt columns
async function getV1Key(salt: string | null) {
  return salt ? createSaltedEncryptionKey(decodeSalt(salt)) : undefined;
}

async function decryptValue(
  value: string,
  context: { model: string; field: string },
  options: { v1Key?: CryptoKey; allowPlaintext?: boolean } = {},
) {
  if (value === ANONYMIZED) return ANONYMIZED;
  if (options.v1Key && !isEncrypted(value)) {
    return decryptV1(value, options.v1Key);
  }
  return fieldEncryption.decrypt(value, context, {
    allowPlaintext: options.allowPlaintext,
  });
}

export async function encryptFormEntryFields(
  input: EntryFields & { email: string },
) {
  return {
    givenName: await encryptValue(input.givenName, entryContext("givenName")),
    familyName: await encryptValue(
      input.familyName,
      entryContext("familyName"),
    ),
    email: await encryptValue(input.email, entryContext("email")),
    salt: null,
  };
}

export async function encryptMailingAddressFields(input: AddressFields) {
  return {
    addressLine1: await encryptValue(
      input.addressLine1,
      addressContext("addressLine1"),
    ),
    addressLine2: await encryptValue(
      input.addressLine2,
      addressContext("addressLine2"),
    ),
    postalCode: await encryptValue(
      input.postalCode,
      addressContext("postalCode"),
    ),
    city: await encryptValue(input.city, addressContext("city")),
    state: await encryptValue(input.state, addressContext("state")),
    country: await encryptValue(input.country, addressContext("country")),
    salt: null,
  };
}

export async function decryptFormEntryFields<
  T extends EntryFields & { email: string | null; salt: string | null },
>(entry: T): Promise<T> {
  // TODO(201-cleanup): drop the v1 and allowPlaintext (email) reads
  const v1Key = await getV1Key(entry.salt);
  return {
    ...entry,
    givenName: await decryptValue(entry.givenName, entryContext("givenName"), {
      v1Key,
    }),
    familyName: await decryptValue(
      entry.familyName,
      entryContext("familyName"),
      { v1Key },
    ),
    email:
      entry.email === null
        ? null
        : await decryptValue(entry.email, entryContext("email"), {
            allowPlaintext: true,
          }),
  };
}

export async function decryptMailingAddressFields<
  T extends AddressFields & { salt: string | null },
>(address: T): Promise<T> {
  // TODO(201-cleanup): drop the v1 read
  const v1Key = await getV1Key(address.salt);
  const result = { ...address };
  for (const field of mailingAddressFields) {
    result[field] = await decryptValue(address[field], addressContext(field), {
      v1Key,
    });
  }
  return result;
}

/** Whether any field of the entry still needs to be written as v2 */
export function formEntryNeedsReencryption(
  entry: EntryFields & { email: string | null },
) {
  return [entry.givenName, entry.familyName, entry.email].some(
    (value) =>
      value !== null &&
      value !== ANONYMIZED &&
      fieldEncryption.needsReencryption(value),
  );
}

export function mailingAddressNeedsReencryption(address: AddressFields) {
  return mailingAddressFields.some(
    (field) =>
      address[field] !== ANONYMIZED &&
      fieldEncryption.needsReencryption(address[field]),
  );
}

/** Re-encrypt a row, returns the data to write (or null if nothing to do) */
export async function reencryptFormEntry(
  entry: EntryFields & { email: string | null; salt: string | null },
) {
  if (!formEntryNeedsReencryption(entry) && entry.salt === null) return null;
  const plain = await decryptFormEntryFields(entry);
  const { email, ...encrypted } = await encryptFormEntryFields({
    givenName: plain.givenName,
    familyName: plain.familyName,
    email: plain.email ?? ANONYMIZED,
  });
  // Keep a missing email as NULL
  return { ...encrypted, email: plain.email === null ? null : email };
}

export async function reencryptMailingAddress(
  address: AddressFields & { salt: string | null },
) {
  if (!mailingAddressNeedsReencryption(address) && address.salt === null)
    return null;
  return encryptMailingAddressFields(
    await decryptMailingAddressFields(address),
  );
}
