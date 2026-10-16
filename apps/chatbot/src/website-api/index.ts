import { env } from "@/env";

interface FetchOptions<RequestBody> {
  url: URL;
  method?: RequestInit["method"];
  body?: RequestBody;
  timeout?: number | false;
}

const defaultTimeout = 10_000;

export type ApiErrorKind = "timeout" | "network" | "http";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options?.status;
  }

  /** Whether repeating the same request could plausibly succeed. */
  get isTransient() {
    return (
      this.kind !== "http" ||
      this.status === undefined ||
      this.status >= 500 ||
      this.status === 408 ||
      this.status === 429
    );
  }

  /** Short description that is safe to show in chat. */
  get summary() {
    switch (this.kind) {
      case "timeout":
        return "request timed out";
      case "network":
        return "could not reach website";
      case "http":
        return `website returned HTTP ${this.status}`;
    }
  }
}

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

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.API_SECRET}`,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError("timeout", `Request timed out after ${timeout}ms`, {
        cause: error,
      });
    }
    throw new ApiError("network", "Network error while fetching", {
      cause: error,
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      "http",
      `HTTP error! status: ${response.status} ${response.statusText}`,
      { status: response.status },
    );
  }

  return response.json();
}
