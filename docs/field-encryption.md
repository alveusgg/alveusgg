# Field encryption

The shared helpers in [`@alveusgg/database/encryption`](../apps/database/src/encryption.ts) encrypt personal data and secrets stored in the database. For initial key generation and local development setup, see [Data encryption keys](../README.md#data-encryption-keys).

## Key configuration

`DATA_ENCRYPTION_KEYS` holds the keys for encrypting personal data and secrets (e.g. OAuth tokens) in the database: a comma-separated list of `<key id>:<base64 key>`. Key ids may contain `a-z` and `0-9`. The first key encrypts new values, every key in the list can decrypt. Give each new key a new id; don't replace the secret under an existing id or rename a key that has already encrypted data.

`DATA_BLIND_INDEX_KEY` is used for keyed hashes that let us look up encrypted values (e.g. email addresses) without decrypting them. Changing it means recomputing every stored hash, so it is not rotated with the encryption keys.

## Key rotation

1. Add the new key at the end of the list everywhere the keys are set, e.g. `k1:<old>,k2:<new>`, and deploy. This way everything that's running can decrypt `k2` values before the first one is written.
2. Move the new key to the front, e.g. `k2:<new>,k1:<old>`, and deploy. New values are now encrypted with `k2`. Services that haven't yet deployed with this change are already able to decrypt `k2` values from the previous step.
3. Wait until every service and job that writes encrypted data uses `k2` as its first key, including any older deployments that can still write to the same database. Keep both keys configured while [re-encrypting the existing values](#re-encrypting-existing-values).
4. After verifying the backfill as described below, remove `k1` from the deployed keyrings and redeploy every consumer. Any deployment used for rollback must use the updated keyring too.

### Re-encrypting existing values

The helpers don't track which columns use encryption or provide a database backfill command. Each feature that starts encrypting data should document its model/field pairs and how to run its backfill. Follow this process for every affected field:

1. Take a database backup and confirm its encryption keys are stored in the password manager. Test the backfill on a disposable database before running it against production.
2. Read rows in small batches, ordered and paginated by a stable unique id. Leave `null` values alone; empty strings are values and still need encryption. Use the rotated keyring (`k2:<new>,k1:<old>`) for the backfill.
3. For each value where `needsReencryption(value)` returns `true`, call `decrypt(value, { model, field })`, then `encrypt(plaintext, { model, field })` with the same context used by the application. This decrypts with the old key and encrypts with the active key. Don't encrypt the ciphertext itself or change its key id prefix. Key rotation expects encrypted values; migrating plaintext or the legacy `DATA_ENCRYPTION_PASSPHRASE` format needs a separate migration.
4. Write the replacement only if the row still contains the value that was read (e.g. a Prisma `updateMany` filtered by both the row id and the original stored value). If it changed, re-read and retry so the backfill doesn't overwrite a concurrent update. Alternatively, pause all affected writers for the duration of the backfill.
5. Keep progress and failure counts so the backfill can be resumed. Already updated values will be skipped by `needsReencryption`. Leave values that fail decryption untouched and investigate them before retiring any key. Logs should contain row ids, field names and counts, never plaintext, ciphertext or key material.
6. Once all writers use the new key and the backfill finishes, scan every affected field again. Every non-null value must decrypt successfully with the correct context and return `false` from `needsReencryption`. That helper only checks the key id; it doesn't validate the ciphertext. Resolve failures or remaining old-key values before removing the old key from the deployed keyrings. Leave blind indexes and `DATA_BLIND_INDEX_KEY` unchanged during encryption-key rotation.

## Key storage and backups

Keep a copy of every key outside of the deployment environment (e.g. in the team's password manager): data encrypted with a lost key can't be recovered. Retain retired keys while backups still contain data encrypted with them. When restoring an older backup, append its retired keys to the current keyring before reading the data, then repeat the backfill before removing them from the deployed keyrings again.
