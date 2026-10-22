import { beforeEach, expect, test, vi } from "vitest";

import { presetTransaction } from "@/server/presets/database";

const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("@alveusgg/database", () => ({
  prisma: { $transaction: transaction },
}));
beforeEach(() => vi.resetAllMocks());

test.each([{ code: "P2034" }, { code: "P2010", meta: { code: "1213" } }])(
  "retries a rolled-back transaction on database deadlock: %j",
  async (error) => {
    transaction.mockRejectedValueOnce(error).mockResolvedValueOnce("committed");
    expect(await presetTransaction(async () => "committed")).toBe("committed");
    expect(transaction).toHaveBeenCalledTimes(2);
  },
);

test("deadlock retries remain bounded", async () => {
  const error = { code: "P2010", meta: { code: "1213" } };
  transaction.mockRejectedValue(error);
  await expect(presetTransaction(async () => undefined)).rejects.toBe(error);
  expect(transaction).toHaveBeenCalledTimes(3);
});

test("other raw-query failures are propagated without retry", async () => {
  const error = { code: "P2010", meta: { code: "1146" } };
  transaction.mockRejectedValue(error);
  await expect(presetTransaction(async () => undefined)).rejects.toBe(error);
  expect(transaction).toHaveBeenCalledTimes(1);
});
