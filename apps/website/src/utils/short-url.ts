import { env } from "@/env/index.mjs";

export function getShortBaseUrl() {
  return env.NEXT_PUBLIC_SHORT_BASE_URL ?? env.NEXT_PUBLIC_BASE_URL;
}
