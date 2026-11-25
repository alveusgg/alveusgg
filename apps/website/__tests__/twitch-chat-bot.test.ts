import { afterEach, describe, expect, test, vi } from "vitest";

import type * as Database from "@alveusgg/database";

import { getChatBotAccount } from "@/server/db/twitch-channels";

import { channels } from "@/data/twitch";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    twitchChannel: { findFirst: vi.fn() },
    account: { findFirst: vi.fn() },
  },
}));

vi.mock("@/env", () => ({ env: {} }));
vi.mock("@alveusgg/database", async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  prisma: mockPrisma,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("getChatBotAccount", () => {
  test("posts as the account of the picked channel", async () => {
    mockPrisma.twitchChannel.findFirst.mockResolvedValue({
      channelId: "bot-channel",
    });
    mockPrisma.account.findFirst.mockResolvedValue({
      access_token: "bot-token",
    });

    await expect(getChatBotAccount()).resolves.toEqual({
      userId: "bot-channel",
      accessToken: "bot-token",
    });
    expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
      where: { provider: "twitch", providerAccountId: "bot-channel" },
      select: { access_token: true },
    });
  });

  test("posts as AlveusGG while no channel is picked", async () => {
    mockPrisma.twitchChannel.findFirst.mockResolvedValue(null);
    mockPrisma.account.findFirst.mockResolvedValue({
      access_token: "alveusgg-token",
    });

    await expect(getChatBotAccount()).resolves.toEqual({
      userId: channels.alveusgg.id,
      accessToken: "alveusgg-token",
    });
  });
});
