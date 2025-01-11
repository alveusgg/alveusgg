import { env } from "@/env";

export async function callEndpoint<T>(endpoint: string, body: T) {
  const bodyText = JSON.stringify(body);
  const fullEndpointUrl = new URL(
    endpoint,
    env.NEXT_PUBLIC_BASE_URL,
  ).toString();

  // Use queue
  if (env.UPSTASH_QSTASH_URL && env.UPSTASH_QSTASH_KEY) {
    const resp = await fetch(`${env.UPSTASH_QSTASH_URL}${fullEndpointUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.UPSTASH_QSTASH_KEY}`,
        "Upstash-Forward-Authorization": `Bearer ${env.ACTION_API_SECRET}`,
      },
      body: bodyText,
    });
    await new Promise((res) => setTimeout(res, 1000 / 100)); // Naive 100 rps limit
    return resp;
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
