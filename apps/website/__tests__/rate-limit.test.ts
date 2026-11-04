import type { NextApiRequest } from "next";
import { expect, test, vi } from "vitest";

import { getClientIp } from "@/server/utils/rate-limit";

vi.mock("@/env", () => {
  return {
    env: {},
  };
});

const request = (
  forwardedFor: string | string[] | undefined,
  remoteAddress?: string,
) =>
  ({
    headers: { "x-forwarded-for": forwardedFor },
    socket: { remoteAddress },
  }) as unknown as NextApiRequest;

test("uses the first forwarded address", () => {
  expect(getClientIp(request("203.0.113.7, 10.0.0.1"))).toBe("203.0.113.7");
  expect(getClientIp(request(["203.0.113.8", "10.0.0.1"]))).toBe("203.0.113.8");
});

test("falls back to the socket address without a proxy header", () => {
  expect(getClientIp(request(undefined, "127.0.0.1"))).toBe("127.0.0.1");
  expect(getClientIp(request(" ", "127.0.0.1"))).toBe("127.0.0.1");
});

test("returns undefined when nothing is known", () => {
  expect(getClientIp(request(undefined))).toBeUndefined();
});
