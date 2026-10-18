import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Context } from "@/server/trpc/context";
import { adminDashboardRouter } from "@/server/trpc/router/admin/dashboard";

const { database, getPostsCount, getUsersCount } = vi.hoisted(() => ({
  database: {
    user: { count: vi.fn() },
    notification: { count: vi.fn(), findMany: vi.fn() },
    pushSubscription: { count: vi.fn() },
    formEntry: { count: vi.fn() },
    calendarEvent: { count: vi.fn() },
    shortLinks: { count: vi.fn() },
    showAndTellEntry: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
  getPostsCount: vi.fn(),
  getUsersCount: vi.fn(),
}));

vi.mock("@alveusgg/database", () => ({ prisma: database }));
vi.mock("@/server/db/show-and-tell", () => ({ getPostsCount, getUsersCount }));
vi.mock("@/server/trpc/context", () => ({}));
vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "test",
    SUPER_USER_IDS: "superuser",
    DISABLE_ADMIN_AUTH: false,
  },
}));

function caller(roles = ["dashboard"], id = "dashboard-user") {
  return adminDashboardRouter.createCaller({
    session: {
      expires: "2099-01-01",
      user: { id, roles, scopes: [], isSuperUser: id === "superuser" },
    },
    prisma: database,
  } as unknown as Context);
}

describe("admin dashboard permissions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    for (const model of [
      database.user,
      database.notification,
      database.pushSubscription,
      database.formEntry,
      database.calendarEvent,
      database.shortLinks,
    ]) {
      model.count.mockResolvedValue(4);
    }
    getPostsCount.mockResolvedValue(2);
    getUsersCount.mockResolvedValue(1);
    database.notification.findMany.mockResolvedValue([{ id: "notification" }]);
    database.showAndTellEntry.findMany.mockResolvedValue([
      { id: "pending-post", approvedAt: null },
    ]);
    database.$queryRaw.mockResolvedValue([]);
  });

  afterEach(() => vi.useRealTimers());

  test("rejects users without dashboard access on every endpoint", async () => {
    const client = caller(["donations", "showAndTell", "notifications"]);
    for (const request of [
      client.getOverviewStats(),
      client.getRecentActivity(),
      client.getChartData({ days: 7 }),
    ]) {
      await expect(request).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }
  });

  test("does not query or return content for a dashboard-only user", async () => {
    const client = caller();
    expect(await client.getRecentActivity()).toEqual({
      recentShowAndTell: [],
      recentNotifications: [],
    });
    expect(await client.getOverviewStats()).toEqual({
      totalUsers: null,
      totalShowAndTellPosts: null,
      totalShowAndTellUsers: null,
      totalNotifications: null,
      totalPushSubscriptions: null,
      totalFormEntries: null,
      totalCalendarEvents: null,
      totalShortLinks: null,
    });
    expect(await client.getChartData({ days: 7 })).toEqual([]);
    expect(database.showAndTellEntry.findMany).not.toHaveBeenCalled();
    expect(database.notification.findMany).not.toHaveBeenCalled();
    expect(database.$queryRaw).not.toHaveBeenCalled();
    expect(getPostsCount).not.toHaveBeenCalled();
    expect(getUsersCount).not.toHaveBeenCalled();
    for (const model of [
      database.user,
      database.notification,
      database.pushSubscription,
      database.formEntry,
      database.calendarEvent,
      database.shortLinks,
    ]) {
      expect(model.count).not.toHaveBeenCalled();
    }
  });

  test("a forms manager only receives form statistics", async () => {
    expect(
      await caller(["dashboard", "forms"]).getOverviewStats(),
    ).toMatchObject({
      totalFormEntries: 4,
      totalUsers: null,
      totalNotifications: null,
      totalShowAndTellPosts: null,
    });
    expect(database.formEntry.count).toHaveBeenCalledOnce();
    expect(database.notification.count).not.toHaveBeenCalled();
  });

  test.each([
    { role: "showAndTell", showAndTell: true, notifications: false },
    { role: "notifications", showAndTell: false, notifications: true },
  ])(
    "restricts recent activity to the $role role",
    async ({ role, showAndTell, notifications }) => {
      const result = await caller(["dashboard", role]).getRecentActivity();
      expect(result.recentShowAndTell).toHaveLength(showAndTell ? 1 : 0);
      expect(result.recentNotifications).toHaveLength(notifications ? 1 : 0);
      expect(database.showAndTellEntry.findMany).toHaveBeenCalledTimes(
        showAndTell ? 1 : 0,
      );
      expect(database.notification.findMany).toHaveBeenCalledTimes(
        notifications ? 1 : 0,
      );
      if (showAndTell) {
        expect(database.showAndTellEntry.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: expect.objectContaining({
              updatedAt: true,
              approvedAt: true,
            }),
          }),
        );
      }
    },
  );

  test.each([
    { role: "donations", table: "Donation", calls: 1, hidden: "showAndTell" },
    {
      role: "showAndTell",
      table: "ShowAndTellEntry",
      calls: 1,
      hidden: "donations",
    },
  ])(
    "only queries authorized $role chart data",
    async ({ role, table, calls, hidden }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-17T18:00:00Z"));
      database.$queryRaw.mockResolvedValue([
        { date: "2026-10-11", count: BigInt(2), total: "500" },
      ]);
      const result = await caller(["dashboard", role]).getChartData({
        days: 7,
      });
      expect(result).toHaveLength(7);
      expect(result[0]).toMatchObject({ date: "2026-10-11", [hidden]: null });
      expect(result[6]?.date).toBe("2026-10-17");
      if (role === "donations") {
        expect(result[0]).toMatchObject({ donations: 2, donationAmount: 500 });
        expect(result[1]).toMatchObject({ donations: 0, donationAmount: 0 });
      }
      expect(
        result.every(
          (day) => day[hidden as "donations" | "showAndTell"] === null,
        ),
      ).toBe(true);
      expect(database.$queryRaw).toHaveBeenCalledTimes(calls);
      for (const [query, since] of database.$queryRaw.mock.calls) {
        expect(query.join("")).toContain(`FROM ${table}`);
        expect(since).toEqual(new Date("2026-10-11T00:00:00Z"));
      }
    },
  );

  test("superusers retain access without explicit domain roles", async () => {
    const client = caller([], "superuser");
    expect(await client.getOverviewStats()).toMatchObject({
      totalUsers: 4,
      totalShowAndTellPosts: 2,
      totalFormEntries: 4,
    });
    expect(await client.getRecentActivity()).toMatchObject({
      recentShowAndTell: [{ id: "pending-post" }],
      recentNotifications: [{ id: "notification" }],
    });
    await client.getChartData({ days: 7 });
    expect(database.$queryRaw).toHaveBeenCalledTimes(2);
    for (const [query] of database.$queryRaw.mock.calls)
      expect(query.join("")).not.toContain("FROM User");
  });
});
