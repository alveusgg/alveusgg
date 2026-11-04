# Field encryption

The shared helpers in [`@alveusgg/database/encryption`](../apps/database/src/encryption.ts) encrypt personal data and secrets stored in the database. For initial key generation and local development setup, see [Data encryption keys](../README.md#data-encryption-keys).

## Key configuration

`DATA_ENCRYPTION_KEYS` holds the application encryption keyring: a comma-separated list of `<key id>:<base64 key>`. Key ids may contain `a-z` and `0-9`. The first key encrypts new values, every key in the list can decrypt. Give each new key a new id; don't replace the secret under an existing id or rename a key that has already encrypted data.

`DATA_BLIND_INDEX_KEY` is used for keyed hashes that let us look up encrypted values without decrypting them. Changing it means recomputing every stored hash, so it is not rotated with the encryption keys.

## Key rotation

1. Add the new key at the end of the list everywhere the keys are set, e.g. `k1:<old>,k2:<new>`, and deploy. This way everything that's running can decrypt `k2` values before the first one is written.
2. Move the new key to the front, e.g. `k2:<new>,k1:<old>`, and deploy. New values are now encrypted with `k2`. Services that haven't yet deployed with this change are already able to decrypt `k2` values from the previous step.
3. Wait until every service and job that writes encrypted data uses `k2` as its first key, including any older deployments that can still write to the same database. Keep both keys configured while [re-encrypting the existing values](#re-encrypting-existing-values).
4. After verifying the backfill as described below, remove `k1` from the deployed keyrings and redeploy every consumer. Any deployment used for rollback must use the updated keyring too.

### Re-encrypting existing values

The helpers don't track which columns use encryption or provide a database backfill command. Each consumer should document its model/field pairs and backfill entry point in its maintenance instructions. Follow this process for every affected field:

1. Take a database backup and confirm its encryption keys are stored in the password manager. Test the backfill on a disposable database before running it against production.
2. Read rows in small batches, ordered and paginated by a stable unique id. Leave `null` values alone. Preserve feature-defined empty markers for missing or anonymized values. Other empty strings are values and should be encrypted normally. Use the rotated keyring (`k2:<new>,k1:<old>`) for the backfill.
3. For each value where `needsReencryption(value)` returns `true`, call `decrypt(value, { model, field })`, then `encrypt(plaintext, { model, field })` with the same context used by the application. This decrypts with the old key and encrypts with the active key. Don't encrypt the ciphertext itself or change its key id prefix. Existing v2 values must always decrypt successfully; never treat malformed ciphertext as plaintext. Initial migrations may need feature-specific compatibility readers; keep those paths limited to the fields that require them.
4. Write the replacement only if the row still contains every source value used to compute it. Use parameterized conditional updates with byte-for-byte text comparisons, including case and trailing spaces, and appropriate comparisons for structured values. MySQL's default text collation is not sufficient for an exact ciphertext comparison. If the condition no longer matches, re-read and recompute; after three unsuccessful attempts the row is reported as a failure for a later rerun.
5. Keep progress and failure counts so the backfill can be resumed. Already updated values will be skipped by `needsReencryption`. Leave values that fail decryption untouched and investigate them before retiring any key. Logs should contain row ids, field names, fixed error codes and counts, never plaintext, ciphertext, raw error messages or key material. Disable query/error logging in the backfill's database client so database errors cannot bypass that filtering.
6. Once all writers use the new key and the backfill finishes, scan every affected field again. Every stored ciphertext must decrypt successfully with the correct context and return `false` from `needsReencryption`. Only the feature-defined null/empty markers described above are exempt. Verify lookup indexes against the normalized decrypted value as well. That helper only checks the key id; it doesn't validate the ciphertext. Resolve failures or remaining old-key values before removing the old key from the deployed keyrings. Keep existing blind indexes and `DATA_BLIND_INDEX_KEY` unchanged during encryption-key rotation; initial migrations may populate a missing index. A rerun that reports no updates is not a substitute for this verification scan.

## Running and verifying a backfill

Use the consuming feature's maintenance instructions for its entry point, deployment prerequisites and supported formats. Run the backfill with the intended keyring, then perform a separate read-only verification scan over every affected row.

Verification must authenticate each stored ciphertext with its correct context, check the active key and validate any lookup indexes. Handle feature-defined null/empty markers explicitly. Verification must not modify data and must return a nonzero exit status for invalid ciphertext, incomplete migration, unresolved write conflicts or inconsistent indexes.

Resolve failures and repeat the backfill and verification before retiring keys or removing compatibility readers. A successful rerun that reports no updates does not replace this verification scan.

## Key storage and backups

Keep a copy of every key outside of the deployment environment (e.g. in the team's password manager): data encrypted with a lost key can't be recovered. Retain retired keys while backups still contain data encrypted with them. When restoring an older backup, append its retired keys to the current keyring before reading the data, then repeat the backfill before removing them from the deployed keyrings again.
