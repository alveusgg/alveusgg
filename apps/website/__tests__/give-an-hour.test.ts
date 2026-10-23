import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGiveAnHourStats } from "@/server/db/show-and-tell";

import { countFirstTimeGiveAnHourParticipants } from "@/utils/give-an-hour";

vi.mock("@/env", () => ({ env: {} }));

const { mockAggregate, mockFindMany, updatedAtField } = vi.hoisted(() => ({
  mockAggregate: vi.fn(),
  mockFindMany: vi.fn(),
  updatedAtField: Symbol("updatedAt"),
}));

vi.mock("@alveusgg/database", () => ({
  prisma: {
    showAndTellEntry: {
      aggregate: mockAggregate,
      fields: { updatedAt: updatedAtField },
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
  const approvedFilter = { approvedAt: { gte: updatedAtField } };
  const campaignWhere = {
    AND: [
      approvedFilter,
      { volunteeringMinutes: { gt: 0 } },
      { OR: [{ createdAt: { gte: start, lt: end } }] },
    ],
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-04-01T12:00:00.000Z"));
    vi.clearAllMocks();

    mockAggregate.mockResolvedValue({
      _sum: { volunteeringMinutes: 180 },
      _count: { _all: 2 },
    });
    // Answer each of the skinny distinct queries based on the columns it selects
    mockFindMany.mockImplementation(
      async ({
        select,
        where,
      }: {
        select: Record<string, boolean>;
        where: { AND: object[] };
      }) => {
        if (select.location)
          return [{ location: "Austin, Texas, United States" }];
        if (select.userId && select.displayName) {
          // Identity pairs: prior history is filtered by createdAt, campaign participants by the campaign window
          return where.AND.some((condition) => "createdAt" in condition)
            ? [{ userId: null, displayName: "Prior Name" }]
            : [
                { userId: "user-one", displayName: "Prior Name" },
                { userId: null, displayName: "Anonymous" },
              ];
        }
        if (select.userId) return [{ userId: "user-one" }];
        return [{ displayName: "Anonymous" }];
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aggregates in Prisma and only loads distinct identities and locations", async () => {
    const result = await getGiveAnHourStats({ ranges: [{ start, end }] });

    expect(mockAggregate).toHaveBeenCalledTimes(2);
    expect(mockAggregate).toHaveBeenCalledWith({
      _sum: { volunteeringMinutes: true },
      _count: { _all: true },
      where: campaignWhere,
    });
    expect(mockFindMany).toHaveBeenCalledTimes(5);
    expect(mockFindMany).toHaveBeenCalledWith({
      select: { userId: true },
      where: { AND: [campaignWhere, { userId: { not: null } }] },
      distinct: ["userId"],
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      select: { displayName: true },
      where: {
        AND: [campaignWhere, { userId: null }, { displayName: { not: null } }],
      },
      distinct: ["displayName"],
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      select: { location: true },
      where: { AND: [campaignWhere, { location: { not: null } }] },
      distinct: ["location"],
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      select: { userId: true, displayName: true },
      where: campaignWhere,
      distinct: ["userId", "displayName"],
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      select: { userId: true, displayName: true },
      where: {
        AND: [
          approvedFilter,
          { createdAt: { lt: start } },
          {
            OR: [
              { userId: { in: ["user-one"] } },
              { displayName: { in: ["Prior Name", "Anonymous"] } },
            ],
          },
        ],
      },
      distinct: ["userId", "displayName"],
    });
    expect(result).toEqual({
      hours: 3,
      posts: 2,
      participants: 2,
      averageHoursPerParticipant: 2,
      locations: 1,
      countries: 1,
      averagePostsPerCampaign: 2,
      averageFirstTimeParticipantsPerCampaign: 1,
      averageCommunityHoursPerCampaign: 3,
      recordCampaign: { year: 2024, hours: 3 },
      campaigns: [{ year: 2024, firstTimeParticipants: 1 }],
    });
  });

  it("skips campaigns that have not started and keeps running ones out of the averages", async () => {
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

    // No queries for the campaign that hasn't started
    expect(mockAggregate).toHaveBeenCalledTimes(3);
    expect(mockFindMany).toHaveBeenCalledTimes(7);
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
