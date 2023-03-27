export type WebPushHttpsRequestOptions = {
  headers?: HeadersInit;
  timeout?: number;
};

export async function requestHttps(
  endpoint: string,
  body?: Buffer | string | null,
  options?: WebPushHttpsRequestOptions
) {
  const controller = new AbortController();

  let timeoutId: string | number | NodeJS.Timeout | undefined;
  if (options?.timeout) {
    timeoutId = setTimeout(() => controller.abort(), options.timeout);
  }

  console.log("SEND WEB PUSH", endpoint, options?.headers, body);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: options?.headers,
    signal: controller.signal,
    body,
  }).then(async (response) => {
    console.log("WEB PUSH RESPONSE", response.status, response.statusText);
    if (response.ok) {
      return {
        statusCode: response.status,
        body: await response.text(),
        headers: response.headers,
      };
    } else {
      throw new Error(
        `Received unexpected response code ${response.status} - ${response.statusText}`
      );
    }
  });
  if (timeoutId) clearTimeout(timeoutId);

  return response;
}
