import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { UpstashRedisCache } from "@/server/utils/redis";

vi.mock("@/env", () => ({
  env: {
    UPSTASH_REDIS_REST_URL: "https://redis.example.test",
    UPSTASH_REDIS_REST_TOKEN: "test-token",
  },
}));

// A minimal Upstash REST endpoint: values are stored exactly as sent and
// returned base64-encoded, as the client requests by default.
const stored = new Map<string, string>();
function run([command, key, value]: string[]) {
  if (command === "set") {
    stored.set(key!, value!);
    return "OK";
  }
  if (command === "get") {
    const raw = stored.get(key!);
    return raw === undefined ? null : Buffer.from(raw).toString("base64");
  }
  throw new Error(`Unexpected Redis command: ${command}`);
}
beforeEach(() => {
  stored.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      return new Response(
        JSON.stringify(
          url.endsWith("/pipeline")
            ? body.map((command: string[]) => ({ result: run(command) }))
            : { result: run(body) },
        ),
      );
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

test.each([
  "7c1f0a52-1d5b-4d39-a2a6-5d3f6a0e4f11",
  "123",
  42,
  { banned: false, revision: null },
])("Upstash values are JSON-decoded exactly once: %j", async (value) => {
  const cache = new UpstashRedisCache();
  await cache.set("key", value);
  expect(stored.get("key")).toBe(JSON.stringify(value));
  expect(await cache.get("key")).toEqual(value);
});

test("a missing Upstash value reads as null", async () => {
  expect(await new UpstashRedisCache().get("missing")).toBeNull();
});
