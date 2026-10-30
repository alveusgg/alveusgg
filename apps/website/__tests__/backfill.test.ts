import { afterEach, describe, expect, test, vi } from "vitest";

import { createFieldEncryption } from "@alveusgg/database/encryption";

import {
  logBackfillFailure,
  retryChangedRow,
  verifyEncryptedValue,
} from "../build-scripts/backfill-utils";

const key1 = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";
const key2 = "ZmVkY2JhOTg3NjU0MzIxMGZlZGNiYTk4NzY1NDMyMTA=";
const context = { model: "Account", field: "access_token" };
afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("conditional backfill retries", () => {
  test("recomputes from the latest row after a concurrent token refresh", async () => {
    const initial = { token: "old-token" };
    const latest = { token: "refreshed-token" };
    const seen: string[] = [];
    const updated = await retryChangedRow(
      initial,
      async () => latest,
      async (row) => {
        seen.push(row.token);
        return row === initial ? 0 : 1;
      },
    );
    expect(updated).toBe(true);
    expect(seen).toEqual(["old-token", "refreshed-token"]);
  });
  test("leaves deleted or already migrated rows alone", async () => {
    expect(
      await retryChangedRow(
        {},
        async () => null,
        async () => 0,
      ),
    ).toBe(false);
    expect(
      await retryChangedRow(
        {},
        async () => {
          throw new Error("unneeded read");
        },
        async () => null,
      ),
    ).toBe(false);
  });
  test("reports a persistently changing row instead of looping forever", async () => {
    let attempts = 0;
    await expect(
      retryChangedRow(
        {},
        async () => ({}),
        async () => {
          attempts++;
          return 0;
        },
      ),
    ).rejects.toMatchObject({ code: "CONCURRENT_UPDATE" });
    expect(attempts).toBe(3);
  });
});

describe("backfill verification", () => {
  test("validates authentication and the active key, not just the prefix", async () => {
    const old = createFieldEncryption({ keys: `k1:${key1}` });
    const current = createFieldEncryption({ keys: `k2:${key2},k1:${key1}` });
    const oldValue = await old.encrypt("token", context);
    await expect(
      verifyEncryptedValue(current, oldValue, context),
    ).rejects.toThrow("retired key");
    const value = await current.encrypt("token", context);
    expect(await verifyEncryptedValue(current, value, context)).toBe("token");
    await expect(
      verifyEncryptedValue(current, value.slice(0, 20), context),
    ).rejects.toThrow();
    await expect(
      verifyEncryptedValue(current, value, {
        ...context,
        field: "refresh_token",
      }),
    ).rejects.toThrow();
    await expect(
      verifyEncryptedValue(current, "plaintext", context),
    ).rejects.toThrow();
  });
  test("only allows empty markers when the feature declares them", async () => {
    const encryption = createFieldEncryption({ keys: `k1:${key1}` });
    expect(await verifyEncryptedValue(encryption, null, context)).toBeNull();
    expect(
      await verifyEncryptedValue(encryption, "", context, { allowEmpty: true }),
    ).toBe("");
    await expect(
      verifyEncryptedValue(encryption, "", context),
    ).rejects.toThrow();
  });
  test("never logs raw database messages or arbitrary error codes", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    logBackfillFailure(
      "User row-id",
      Object.assign(new Error("private@example.com token secret"), {
        code: "P2010",
      }),
    );
    logBackfillFailure("User row-id", { code: "private@example.com" });
    expect(log.mock.calls).toEqual([
      ["User row-id: P2010"],
      ["User row-id: ERROR"],
    ]);
    expect(process.exitCode).toBe(1);
  });
});
