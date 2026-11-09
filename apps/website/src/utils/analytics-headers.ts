const analyticsHeaderNames = new Set([
  "user-agent",
  "x-forwarded-for",
  "referer",
]);

// Only forward analytics metadata, never cookies or other credentials.
export function getAnalyticsHeaders(
  headers: Headers | Record<string, string | string[] | undefined>,
) {
  const result: Record<string, string | string[]> = {};
  const entries =
    headers instanceof Headers ? headers.entries() : Object.entries(headers);

  for (const [name, value] of entries) {
    const key = name.toLowerCase();
    if (analyticsHeaderNames.has(key) && value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
