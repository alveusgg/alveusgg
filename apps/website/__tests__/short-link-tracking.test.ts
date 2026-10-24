import type { NextApiRequest, NextApiResponse } from "next";
import { type NextFetchEvent, NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import trackClick from "@/pages/api/short-links/track-click";
import { proxy } from "@/proxy";

const { env, getShortLink, upsertTracking } = vi.hoisted(() => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://alveus.test",
    ACTION_API_SECRET: "test-action-secret",
    UPSTASH_QSTASH_URL: undefined as string | undefined,
    UPSTASH_QSTASH_KEY: undefined as string | undefined,
  },
  getShortLink: vi.fn(),
  upsertTracking: vi.fn(),
}));

vi.mock("@/env", () => ({ env }));
vi.mock("@alveusgg/database", () => ({
  prisma: { shortLinksTracking: { upsert: upsertTracking } },
}));
vi.mock("@trpc/client", () => ({
  createTRPCProxyClient: () => ({
    shortLinks: { getShortLink: { query: getShortLink } },
  }),
  httpLink: vi.fn(),
}));

const shortLink = {
  id: "clx00000000000000000000000",
  slug: "example",
  link: "https://example.test/destination",
};
const trackingHeaders = {
  "user-agent": "Test browser",
  "x-forwarded-for": "192.0.2.1",
  referer: "https://alveus.test/",
};
const credentials = {
  cookie: "__Secure-next-auth.session-token=synthetic-session",
  authorization: "Bearer synthetic-authorization",
  "proxy-authorization": "Basic synthetic-proxy-authorization",
  "x-api-key": "synthetic-api-key",
  "x-future-credential": "synthetic-future-credential",
};

async function deliverClick(body: unknown) {
  const request = {
    method: "POST",
    headers: { authorization: `Bearer ${env.ACTION_API_SECRET}` },
    body,
  } as NextApiRequest;
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  await trackClick(request, response as unknown as NextApiResponse);
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith({ success: true });
}

describe("short-link tracking credential isolation", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    env.UPSTASH_QSTASH_URL = undefined;
    env.UPSTASH_QSTASH_KEY = undefined;
    getShortLink.mockResolvedValue(shortLink);
    upsertTracking.mockResolvedValue({});
    fetchMock.mockImplementation(async () => new Response(""));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VERCEL_WEB_ANALYTICS_ENDPOINT", "https://analytics.test/event");
    // Explicit sanitized headers must take precedence over ambient credentials.
    vi.stubGlobal(Symbol.for("@vercel/request-context"), {
      get: () => ({ headers: credentials }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test.each(["direct", "qstash"])(
    "keeps credentials out of %s payloads and analytics requests",
    async (transport) => {
      if (transport === "qstash") {
        env.UPSTASH_QSTASH_URL = "https://qstash.test/v1/publish/";
        env.UPSTASH_QSTASH_KEY = "test-queue-key";
      }
      const pending: Promise<unknown>[] = [];
      const event = {
        waitUntil: (promise: Promise<unknown>) => pending.push(promise),
      } as unknown as NextFetchEvent;
      const request = new NextRequest("https://alveus.test/go/example", {
        headers: { ...trackingHeaders, ...credentials },
      });

      const redirect = await proxy(request, event);
      await Promise.all(pending);

      expect(redirect.status).toBe(307);
      expect(redirect.headers.get("location")).toBe(shortLink.link);
      expect(redirect.headers.get("set-cookie")).toBeNull();
      expect(getShortLink).toHaveBeenCalledWith(shortLink.slug);
      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toBe(
        `${env.UPSTASH_QSTASH_URL ?? ""}${env.NEXT_PUBLIC_BASE_URL}/api/short-links/track-click`,
      );
      const body = JSON.parse(options?.body as string) as unknown;
      expect(body).toEqual({ ...shortLink, headers: trackingHeaders });
      expect(JSON.stringify(options)).not.toContain("synthetic-");

      await deliverClick(body);

      expect(upsertTracking).toHaveBeenCalledWith({
        where: { id: shortLink.id },
        create: { id: shortLink.id, clicks: 1 },
        update: { clicks: { increment: 1 } },
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [analyticsUrl, analyticsOptions] = fetchMock.mock.calls[1]!;
      expect(analyticsUrl).toBe("https://analytics.test/event");
      expect(analyticsOptions?.headers).toMatchObject({
        "user-agent": trackingHeaders["user-agent"],
        "x-vercel-ip": trackingHeaders["x-forwarded-for"],
      });
      expect(JSON.stringify(analyticsOptions)).not.toContain("synthetic-");
      expect(JSON.parse(analyticsOptions?.body as string)).toMatchObject({
        en: "Short link clicked",
        ed: { slug: shortLink.slug, link: shortLink.link },
      });
    },
  );

  test("strips credentials from previously queued messages before analytics", async () => {
    await deliverClick({
      ...shortLink,
      headers: { ...trackingHeaders, ...credentials },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0]!;
    expect(options?.headers).toMatchObject({
      "user-agent": trackingHeaders["user-agent"],
      "x-vercel-ip": trackingHeaders["x-forwarded-for"],
    });
    expect(JSON.stringify(options)).not.toContain("synthetic-");
  });

  test("does not fall back to ambient cookies when tracking headers are empty", async () => {
    await deliverClick({ ...shortLink, headers: {} });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0]![1])).not.toContain(
      "synthetic-",
    );
  });
});
