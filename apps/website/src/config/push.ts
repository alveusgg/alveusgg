import { env } from "@/env/server.mjs";

export const pushLang = env.PUSH_LANG || "en-US";
export const pushTextDir = env.PUSH_TEXT_DIR || "ltr";

export const pushBatchSize = env.PUSH_BATCH_SIZE || 10;
export const pushMaxAttempts = env.PUSH_MAX_ATTEMPTS || 5;
export const pushRetryDelay = env.PUSH_RETRY_DELAY_MS || 10;
