export type WebPushHttpsRequestOptions = {
  headers?: HeadersInit;
  timeout?: number;
};

export async function requestHttps(
  endpoint: string,
  body?: ArrayBuffer | string | null,
  options?: WebPushHttpsRequestOptions
) {
  const controller = new AbortController();

  let timeoutId: string | number | NodeJS.Timeout | undefined;
  if (options?.timeout) {
    timeoutId = setTimeout(() => controller.abort(), options.timeout);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: options?.headers,
    signal: controller.signal,
    body,
  });
  if (timeoutId) clearTimeout(timeoutId);

  return {
    statusCode: response.status,
    body: await response.text(),
    headers: response.headers,
  };
}
