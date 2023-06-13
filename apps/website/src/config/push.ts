import { env } from "@/env/index.mjs";

export const pushLang = env.PUSH_LANG || "en"; // two letter language code
export const pushTextDir = env.PUSH_TEXT_DIR || "ltr"; // "ltr" or "rtl"

export const pushBatchSize = env.PUSH_BATCH_SIZE || 10;
export const pushMaxAttempts = env.PUSH_MAX_ATTEMPTS || 5;
export const pushRetryDelay = env.PUSH_RETRY_DELAY_MS || 10;
