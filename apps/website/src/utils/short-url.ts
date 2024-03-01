import { env } from "@/env";

export function getShortBaseUrl() {
  return env.NEXT_PUBLIC_SHORT_BASE_URL ?? env.NEXT_PUBLIC_BASE_URL;
}
