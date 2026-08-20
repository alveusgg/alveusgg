import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGiveAnHourStats } from "@/server/db/show-and-tell";

import { countFirstTimeGiveAnHourParticipants } from "@/utils/give-an-hour";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses Prisma aggregates and skinny distinct identity/location queries", async () => {
    const start = new Date("2024-03-01T05:00:00.000Z");
    const end = new Date("2024-04-23T04:00:00.000Z");
    const aggregateResult = {
      _sum: { volunteeringMinutes: 180 },
      _count: { _all: 2 },
    };

    mockAggregate
      .mockResolvedValueOnce(aggregateResult)
      .mockResolvedValueOnce(aggregateResult);
    mockFindMany
      .mockResolvedValueOnce([{ userId: "user-one" }])
      .mockResolvedValueOnce([{ displayName: "Anonymous" }])
      .mockResolvedValueOnce([{ location: "Austin, Texas, United States" }])
      .mockResolvedValueOnce([
        { userId: "user-one", displayName: "Prior Name" },
        { userId: null, displayName: "Anonymous" },
      ])
      .mockResolvedValueOnce([{ userId: null, displayName: "Prior Name" }]);

    const result = await getGiveAnHourStats({ ranges: [{ start, end }] });
    const approvedFilter = { approvedAt: { gte: updatedAtField } };
    const campaignWhere = {
      AND: [
        approvedFilter,
        { volunteeringMinutes: { gt: 0 } },
        { OR: [{ createdAt: { gte: start, lt: end } }] },
      ],
    };

    expect(mockAggregate).toHaveBeenNthCalledWith(1, {
      _sum: { volunteeringMinutes: true },
      _count: { _all: true },
      where: campaignWhere,
    });
    expect(mockAggregate).toHaveBeenNthCalledWith(2, {
      _sum: { volunteeringMinutes: true },
      _count: { _all: true },
      where: campaignWhere,
    });
    expect(mockFindMany).toHaveBeenNthCalledWith(1, {
      select: { userId: true },
      where: { AND: [campaignWhere, { userId: { not: null } }] },
      distinct: ["userId"],
    });
    expect(mockFindMany).toHaveBeenNthCalledWith(2, {
      select: { displayName: true },
      where: {
        AND: [campaignWhere, { userId: null }, { displayName: { not: null } }],
      },
      distinct: ["displayName"],
    });
    expect(mockFindMany).toHaveBeenNthCalledWith(3, {
      select: { location: true },
      where: { AND: [campaignWhere, { location: { not: null } }] },
      distinct: ["location"],
    });
    expect(mockFindMany).toHaveBeenNthCalledWith(4, {
      select: { userId: true, displayName: true },
      where: campaignWhere,
      distinct: ["userId", "displayName"],
    });
    expect(mockFindMany).toHaveBeenNthCalledWith(5, {
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
      recordHighCampaignYear: 2024,
      recordHighCampaignHours: 3,
      campaigns: [{ year: 2024, firstTimeParticipants: 1, hours: 3 }],
    });
  });
});
