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
  RecordType extends RecordToEncryptWithSalt<EncryptionField>
>(input: RecordType, fields: Array<EncryptionField>) {
  const salt = await decodeSalt(input.salt);
  const key = await createSaltedEncryptionKey(salt);

  const result = Object.assign({}, input);
  for (const fieldName of fields) {
    const encryptedValue = input[fieldName];
    if (typeof encryptedValue === "string") {
      const decrypted = await decrypt(encryptedValue, key);
      if (decrypted) {
        result[fieldName] = decrypted as (typeof result)[typeof fieldName];
      }
    }
  }

  return result;
}

export async function encryptRecord<
  EncryptionField extends string,
  RecordType extends RecordToEncrypt<EncryptionField>
>(input: RecordType, fields: Array<EncryptionField>) {
  const salt = await generateSalt();
  const key = await createSaltedEncryptionKey(salt);

  const result: RecordType & { salt: string } = Object.assign({}, input, {
    salt: encodeSalt(salt),
  });

  for (const fieldName of fields) {
    const value = input[fieldName];
    if (typeof value === "string") {
      const encrypted = await encrypt(value, key);
      if (encrypted) {
        result[fieldName] = encrypted as (typeof result)[typeof fieldName];
      }
    }
  }

  return result;
}
