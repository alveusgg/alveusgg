import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ApiError, fetchApi } from "@/website-api";

vi.mock("@/env", () => ({ env: { API_SECRET: "test-api-secret" } }));

const url = new URL(
  "https://website.example/api/notifications/create-notification",
);
const fetchMock = vi.fn<typeof fetch>();

describe("website API failures", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("returns successful JSON and clears the request timer", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }));

    await expect(
      fetchApi({ url, method: "POST", body: { tag: "stream" } }),
    ).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ tag: "stream" }),
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-secret",
        }),
      }),
    );
  });

  test("reports network failure without retrying and preserves its cause", async () => {
    const cause = new TypeError("connection failed");
    fetchMock.mockRejectedValue(cause);

    await expect(fetchApi({ url })).rejects.toMatchObject({
      name: "ApiError",
      kind: "network",
      cause,
      summary: "could not reach website",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("aborts a timed out request and reports a timeout", async () => {
    fetchMock.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );

    const pending = expect(
      fetchApi({ url, timeout: 25 }),
    ).rejects.toMatchObject({
      kind: "timeout",
      summary: "request timed out",
    });
    await vi.advanceTimersByTimeAsync(25);
    await pending;
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test.each([400, 401, 429, 500, 503])(
    "reports HTTP %i without exposing server text in the chat summary",
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response("private server response", {
          status,
          statusText: "private status text",
        }),
      );

      await expect(fetchApi({ url })).rejects.toMatchObject({
        kind: "http",
        status,
        summary: `website returned HTTP ${status}`,
      });
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );

  test("can disable the timeout", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }));
    await expect(fetchApi({ url, timeout: false })).resolves.toEqual({
      success: true,
    });
  });

  test("summaries use fixed descriptions", () => {
    expect(new ApiError("network", "secret").summary).toBe(
      "could not reach website",
    );
    expect(new ApiError("timeout", "secret").summary).toBe("request timed out");
  });
});
