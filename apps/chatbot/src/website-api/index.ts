import { env } from "@/env";

interface FetchOptions<RequestBody> {
  url: URL;
  method?: RequestInit["method"];
  body?: RequestBody;
  timeout?: number | false;
}

const defaultTimeout = 10_000;

export async function fetchApi<RequestBody = unknown>({
  url,
  method,
  body,
  timeout = defaultTimeout,
}: FetchOptions<RequestBody>) {
  const controller = new AbortController();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (timeout) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  const response = await fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.API_SECRET}`,
    },
    signal: controller.signal,
  });

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
