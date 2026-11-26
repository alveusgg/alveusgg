import { createFieldEncryption } from "@alveusgg/database/encryption";

import { env } from "@/env";

/**
 * Encryption helpers for the Twitch OAuth tokens stored in the database.
 * See `@alveusgg/database/encryption` for the format and the README for key rotation.
 */
export const fieldEncryption = createFieldEncryption({
  keys: env.DATA_ENCRYPTION_KEYS,
});
