import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGiveAnHourStats } from "@/server/db/show-and-tell";

import { countFirstTimeGiveAnHourParticipants } from "@/utils/give-an-hour";

vi.mock("@/env", () => ({ env: {} }));

const { mockAggregate, mockFindMany } = vi.hoisted(() => ({
  mockAggregate: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("@alveusgg/database", () => ({
  prisma: {
    showAndTellEntry: {
      aggregate: mockAggregate,
      fields: { updatedAt: Symbol("updatedAt") },
      findMany: mockFindMany,
    },
  },
}));

describe("countFirstTimeGiveAnHourParticipants", () => {
  it("recognizes returning participants by user ID or display name", () => {
    const firstTimeParticipants = countFirstTimeGiveAnHourParticipants(
      [
        { userId: "returning-user", displayName: "A new display name" },
        { userId: null, displayName: "Returning Name" },
        { userId: "new-user", displayName: "New Participant" },
      ],
      [
        { userId: "returning-user", displayName: "Old display name" },
        { userId: null, displayName: "Returning Name" },
      ],
    );

    expect(firstTimeParticipants).toBe(1);
  });

  it("matches prior anonymous history to a logged-in display name", () => {
    const firstTimeParticipants = countFirstTimeGiveAnHourParticipants(
      [
        { userId: "same-current-user", displayName: "Prior Name" },
        { userId: "same-current-user", displayName: "Different Name" },
      ],
      [{ userId: null, displayName: "Prior Name" }],
    );

    expect(firstTimeParticipants).toBe(0);
  });
});

describe("getGiveAnHourStats", () => {
  // The 2024 campaign as the page sends it (midnight in Texas, exclusive end)
  const start = new Date("2024-03-01T06:00:00.000Z");
  const end = new Date("2024-04-23T05:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-04-01T12:00:00.000Z"));
    vi.clearAllMocks();

    // Supply campaign participants and prior anonymous history
    mockFindMany.mockImplementation(
      async ({
        select,
        where,
      }: {
        select: Record<string, boolean>;
        where: { AND: object[] };
      }) => {
        if (select.userId && select.displayName) {
          // Identity pairs: prior history is filtered by createdAt, campaign participants by the campaign window
          return where.AND.some((condition) => "createdAt" in condition)
            ? [{ userId: null, displayName: "Prior Name" }]
            : [
                { userId: "user-one", displayName: "Prior Name" },
                { userId: null, displayName: "Anonymous" },
              ];
        }
        return [];
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("averages completed campaigns while allowing a running campaign to hold the record", async () => {
    const running = {
      start: new Date("2025-03-23T05:00:00.000Z"),
      end: new Date("2025-04-23T05:00:00.000Z"),
    };
    const future = {
      start: new Date("2026-03-23T05:00:00.000Z"),
      end: new Date("2026-05-01T05:00:00.000Z"),
    };
    // The running campaign has already beaten the 2024 one
    mockAggregate.mockImplementation(
      async ({
        where,
      }: {
        where: {
          AND: [object, object, { OR: { createdAt: { gte: Date } }[] }];
        };
      }) =>
        where.AND[2].OR[0]?.createdAt.gte.getTime() === running.start.getTime()
          ? { _sum: { volunteeringMinutes: 600 }, _count: { _all: 4 } }
          : { _sum: { volunteeringMinutes: 180 }, _count: { _all: 2 } },
    );

    const result = await getGiveAnHourStats({
      ranges: [{ start, end }, running, future],
    });

    expect(result.campaigns).toEqual([
      { year: 2024, firstTimeParticipants: 1 },
      { year: 2025, firstTimeParticipants: 1 },
      { year: 2026, firstTimeParticipants: 0 },
    ]);
    // Averages only cover the ended 2024 campaign, the record is live
    expect(result.averageCommunityHoursPerCampaign).toBe(3);
    expect(result.averagePostsPerCampaign).toBe(2);
    expect(result.averageFirstTimeParticipantsPerCampaign).toBe(1);
    expect(result.recordCampaign).toEqual({ year: 2025, hours: 10 });
  });
});
