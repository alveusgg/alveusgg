import { env } from "@/env/index.mjs";

type QueueFetchInit = RequestInit & { headers?: Record<string, string> };
type QueueFetchOptions = { delaySeconds?: number };

const hasQueueEnv = Boolean(env.UPSTASH_QSTASH_URL && env.UPSTASH_QSTASH_KEY);

export function canQueue() {
  return hasQueueEnv;
}

export async function fetchUrl(
  url: string,
  fetchInit?: QueueFetchInit,
  options?: QueueFetchOptions,
) {
  const delay = options?.delaySeconds;
  const fullUrl = new URL(url, env.NEXT_PUBLIC_BASE_URL).toString();

  // Use queue
  if (canQueue()) {
    const headers = fetchInit?.headers ?? {};
    if (headers.Authorization) {
      headers["Upstash-Forward-Authorization"] = headers.Authorization;
    }
    if (delay) {
      headers["Upstash-Delay"] = `${Math.round(delay)}s`;
    }
    headers.Authorization = `Bearer ${env.UPSTASH_QSTASH_KEY}`;

    return fetch(`${env.UPSTASH_QSTASH_URL}${fullUrl}`, {
      ...fetchInit,
      headers,
    });
  }

  if (delay) {
    console.warn(
      "Delaying queued call without a configured queue! This will block the request for the delay time!",
    );
    await new Promise((resolve) => {
      setTimeout(resolve, delay * 1000);
    });
  }

  // Call directly
  return fetch(fullUrl);
}

export function callEndpoint<T>(
  endpoint: string,
  body: T,
  fetchInit?: QueueFetchInit,
  options?: QueueFetchOptions,
) {
  return fetchUrl(
    endpoint,
    {
      ...fetchInit,
      method: "POST",
      headers: {
        ...fetchInit?.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ACTION_API_SECRET}`,
      } as QueueFetchInit["headers"],
      body: JSON.stringify(body),
    },
    options,
  );
}
