import {
  decrypt,
  encrypt,
  createSaltedEncryptionKey,
  generateSalt,
  decodeSalt,
  encodeSalt,
} from "@/server/utils/encryption";

type RecordToEncrypt<EncryptionField extends string> = Record<
  EncryptionField,
  unknown
>;

type RecordToEncryptWithSalt<EncryptionField extends string> =
  RecordToEncrypt<EncryptionField> & { salt: string };

export async function decryptRecord<
  EncryptionField extends string,
  RecordType extends RecordToEncryptWithSalt<EncryptionField>,
>(input: RecordType, fields: Array<EncryptionField>) {
  const salt = await decodeSalt(input.salt);
  const key = await createSaltedEncryptionKey(salt);

  const result = Object.assign({}, input);
  for (const fieldName of fields) {
    const encryptedValue = input[fieldName];
    if (typeof encryptedValue !== "string") {
      throw new Error(`Cannot decrypt non-string value for field ${fieldName}`);
    }

    try {
      const decrypted = await decrypt(encryptedValue, key);
      result[fieldName] = decrypted as (typeof result)[typeof fieldName];
    } catch (e) {
      throw new Error("Could not decrypt record"); // Re-throw with a more generic error message to avoid leaking information
    }
  }

  return result;
}

export async function encryptRecord<
  EncryptionField extends string,
  RecordType extends RecordToEncrypt<EncryptionField>,
>(input: RecordType, fields: Array<EncryptionField>) {
  const salt = await generateSalt();
  const key = await createSaltedEncryptionKey(salt);

  const result: RecordType & { salt: string } = Object.assign({}, input, {
    salt: encodeSalt(salt),
  });

  for (const fieldName of fields) {
    const value = input[fieldName];
    if (typeof value !== "string") {
      throw new Error(`Cannot encrypt non-string value for field ${fieldName}`);
    }

    const encrypted = await encrypt(value, key);
    result[fieldName] = encrypted as (typeof result)[typeof fieldName];
  }

  return result;
}
