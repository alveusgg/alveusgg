import { afterEach, describe, expect, test, vi } from "vitest";

import { encrypt } from "@/server/utils/encryption";
import {
  DEFAULT_NEON_RETURN_TO,
  NEON_DONOR_SESSION_COOKIE,
  createNeonDonorSession,
  createNeonOAuthState,
  getNeonDonorSession,
  getSafeNeonReturnTo,
  verifyNeonOAuthState,
} from "@/server/utils/neon-donor-session";

vi.mock("@/env", () => {
  return {
    env: {
      DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
      NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:3000",
    },
  };
});

afterEach(() => {
  vi.useRealTimers();
});

test("cookies are not prefixed on plain http", () => {
  expect(NEON_DONOR_SESSION_COOKIE).toBe("alveus.neon-donor");
});

describe("getSafeNeonReturnTo", () => {
  test.each([
    [
      "/institute/pixels/the-mural/rename",
      "/institute/pixels/the-mural/rename",
    ],
    ["/institute/pixels/x/rename?a=1", "/institute/pixels/x/rename?a=1"],
    ["http://127.0.0.1:3000/donate", "/donate"],
  ])("keeps %s", (input, expected) => {
    expect(getSafeNeonReturnTo(input)).toBe(expected);
  });

  test.each([
    null,
    "",
    "https://evil.example/",
    "//evil.example/path",
    "/\\evil.example/path",
    "http://127.0.0.1:3000//evil.example",
    "javascript:alert(1)",
  ])("falls back for %s", (input) => {
    expect(getSafeNeonReturnTo(input)).toBe(DEFAULT_NEON_RETURN_TO);
  });
});

describe("OAuth state", () => {
  test("returns the return path for the matching state", async () => {
    const { state, cookie } = await createNeonOAuthState("/donate");
    await expect(verifyNeonOAuthState(cookie, state)).resolves.toBe("/donate");
  });

  test("rejects a different state", async () => {
    const { cookie } = await createNeonOAuthState("/donate");
    const other = await createNeonOAuthState("/donate");
    await expect(verifyNeonOAuthState(cookie, other.state)).resolves.toBe(null);
  });

  test("rejects a missing state or cookie", async () => {
    const { state, cookie } = await createNeonOAuthState("/donate");
    await expect(verifyNeonOAuthState(cookie, null)).resolves.toBe(null);
    await expect(verifyNeonOAuthState(undefined, state)).resolves.toBe(null);
  });

  test("expires after an hour", async () => {
    vi.useFakeTimers();
    const { state, cookie } = await createNeonOAuthState("/donate");
    vi.advanceTimersByTime(30 * 60 * 1000);
    await expect(verifyNeonOAuthState(cookie, state)).resolves.toBe("/donate");
    vi.advanceTimersByTime(30 * 60 * 1000 + 1000);
    await expect(verifyNeonOAuthState(cookie, state)).resolves.toBe(null);
  });
});

describe("donor session", () => {
  test("round-trips the account ID", async () => {
    const { cookie } = await createNeonDonorSession("101177");
    expect(cookie).not.toContain("101177");
    await expect(getNeonDonorSession(cookie)).resolves.toEqual({
      accountId: "101177",
    });
  });

  test("expires after an hour", async () => {
    vi.useFakeTimers();
    const { cookie } = await createNeonDonorSession("101177");
    vi.advanceTimersByTime(60 * 60 * 1000 + 1000);
    await expect(getNeonDonorSession(cookie)).resolves.toBe(null);
  });

  test("rejects tampered and foreign values", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { cookie } = await createNeonDonorSession("101177");
    const tampered = `${cookie.slice(0, -4)}AAAA`;
    await expect(getNeonDonorSession(tampered)).resolves.toBe(null);
    await expect(getNeonDonorSession("not-a-cookie")).resolves.toBe(null);
    await expect(getNeonDonorSession(undefined)).resolves.toBe(null);
    consoleError.mockRestore();
  });

  test("does not accept a state cookie as a session", async () => {
    const { cookie } = await createNeonOAuthState("/donate");
    await expect(getNeonDonorSession(cookie)).resolves.toBe(null);
  });

  test("does not accept values encrypted with another key", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const otherKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const forged = await encrypt(
      JSON.stringify({
        purpose: "neon-donor-session",
        accountId: "1",
        exp: Date.now() / 1000 + 3600,
      }),
      otherKey,
    );
    await expect(getNeonDonorSession(forged)).resolves.toBe(null);
    consoleError.mockRestore();
  });
});
