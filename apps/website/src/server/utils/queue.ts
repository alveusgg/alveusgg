import { env } from "@/env/server.mjs";

export function callEndpoint<T>(endpoint: string, body: T) {
  const bodyText = JSON.stringify(body);
  const fullEndpointUrl = new URL(
    endpoint,
    env.NEXT_PUBLIC_BASE_URL
  ).toString();

  // Use queue
  if (env.UPSTASH_QSTASH_URL && env.UPSTASH_QSTASH_KEY) {
    return fetch(`${env.UPSTASH_QSTASH_URL}${fullEndpointUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.UPSTASH_QSTASH_KEY}`,
        "Upstash-Forward-Authorization": `Bearer ${env.ACTION_API_SECRET}`,
      },
      body: bodyText,
    });
  }

  // Call directly
  return fetch(fullEndpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ACTION_API_SECRET}`,
    },
    body: bodyText,
  });
}
