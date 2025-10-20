import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { getPostsCount, getUsersCount } from "@/server/db/show-and-tell";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.viewDashboard),
);

export const adminDashboardRouter = router({
  getOverviewStats: permittedProcedure.query(async () => {
    // Gather various statistics in parallel
    const [
      totalUsers,
      totalShowAndTellPosts,
      totalShowAndTellUsers,
      totalNotifications,
      totalPushSubscriptions,
      totalFormEntries,
      totalBingoEntries,
      totalCalendarEvents,
      totalShortLinks,
      totalDonations,
      recentSignups,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Show and Tell stats
      getPostsCount(),
      getUsersCount(),

      // Notifications
      prisma.notification.count({
        where: { canceledAt: null },
      }),

      // Push subscriptions (active only)
      prisma.pushSubscription.count({
        where: { deletedAt: null },
      }),

      // Forms
      prisma.formEntry.count(),

      // Bingo entries
      prisma.bingoEntry.count(),

      // Calendar events (future)
      prisma.calendarEvent.count({
        where: {
          startAt: {
            gte: new Date(),
          },
        },
      }),

      // Short links
      prisma.shortLinks.count(),

      // Donations (last 30 days)
      prisma.donation.count({
        where: {
          receivedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent push subscriptions (last 7 days as proxy for engagement)
      prisma.pushSubscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalUsers,
      totalShowAndTellPosts,
      totalShowAndTellUsers,
      totalNotifications,
      totalPushSubscriptions,
      totalFormEntries,
      totalBingoEntries,
      totalCalendarEvents,
      totalShortLinks,
      totalDonations,
      recentSignups,
    };
  }),

  getRecentActivity: permittedProcedure.query(async () => {
    // Get recent activity across different areas
    const [recentShowAndTell, recentNotifications] = await Promise.all([
      prisma.showAndTellEntry.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          approvedAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { canceledAt: null },
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
          isPush: true,
          isDiscord: true,
        },
      }),
    ]);

    return {
      recentShowAndTell,
      recentNotifications,
    };
  }),

  getChartData: permittedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(90).default(30),
      }),
    )
    .query(async ({ input }) => {
      const daysAgo = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get daily breakdown of activities
      const [
        usersByDay,
        donationsByDay,
        donationAmountByDay,
        showAndTellByDay,
      ] = await Promise.all([
        // User growth (accounts created per day)
        prisma.$queryRaw<
          { date: Date; count: bigint }[]
        >`SELECT DATE(u.emailVerified) as date, COUNT(DISTINCT u.id) as count 
           FROM User u
           WHERE u.emailVerified >= ${daysAgo} AND u.emailVerified IS NOT NULL
           GROUP BY DATE(u.emailVerified)
           ORDER BY date ASC`,

        // Donations count per day
        prisma.$queryRaw<
          { date: Date; count: bigint }[]
        >`SELECT DATE(receivedAt) as date, COUNT(*) as count 
           FROM Donation 
           WHERE receivedAt >= ${daysAgo}
           GROUP BY DATE(receivedAt)
           ORDER BY date ASC`,

        // Donation amounts per day
        prisma.$queryRaw<
          { date: Date; total: bigint }[]
        >`SELECT DATE(receivedAt) as date, SUM(amount) as total 
           FROM Donation 
           WHERE receivedAt >= ${daysAgo}
           GROUP BY DATE(receivedAt)
           ORDER BY date ASC`,

        // Show and Tell posts per day
        prisma.$queryRaw<
          { date: Date; count: bigint }[]
        >`SELECT DATE(createdAt) as date, COUNT(*) as count 
           FROM ShowAndTellEntry 
           WHERE createdAt >= ${daysAgo}
           GROUP BY DATE(createdAt)
           ORDER BY date ASC`,
      ]);

      // Fill in missing dates with 0 values
      interface ChartDayData {
        date: string;
        users: number;
        donations: number;
        donationAmount: number;
        showAndTell: number;
      }
      const dateMap = new Map<string, ChartDayData>();
      for (let i = 0; i < input.days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        if (dateStr) {
          dateMap.set(dateStr, {
            date: dateStr,
            users: 0,
            donations: 0,
            donationAmount: 0,
            showAndTell: 0,
          });
        }
      }

      // Populate with actual data
      usersByDay.forEach((row) => {
        const dateStr = row.date.toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.users = Number(row.count);
        }
      });

      donationsByDay.forEach((row) => {
        const dateStr = row.date.toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.donations = Number(row.count);
        }
      });

      donationAmountByDay.forEach((row) => {
        const dateStr = row.date.toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.donationAmount = Number(row.total);
        }
      });

      showAndTellByDay.forEach((row) => {
        const dateStr = row.date.toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.showAndTell = Number(row.count);
        }
      });

      return Array.from(dateMap.values()).reverse(); // Oldest to newest
    }),

  getSystemHealth: permittedProcedure.query(async () => {
    // Check various system health indicators
    const [
      failedWebhooks,
      expiredFileObjects,
      pendingNotificationPushes,
      oldestPendingPush,
    ] = await Promise.all([
      prisma.outgoingWebhook.count({
        where: {
          failedAt: { not: null },
          deliveredAt: null,
        },
      }),

      prisma.fileStorageObject.count({
        where: {
          expiresAt: { lt: new Date() },
          deletedAt: null,
        },
      }),

      prisma.notificationPush.count({
        where: {
          processingStatus: "PENDING",
          expiresAt: { gt: new Date() },
        },
      }),

      prisma.notificationPush.findFirst({
        where: {
          processingStatus: "PENDING",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      failedWebhooks,
      expiredFileObjects,
      pendingNotificationPushes,
      oldestPendingPushAge: oldestPendingPush
        ? Math.floor(
            (Date.now() - oldestPendingPush.createdAt.getTime()) / 1000 / 60,
          )
        : null, // age in minutes
    };
  }),

  getTopContributors: permittedProcedure.query(async () => {
    // Get users with most show and tell posts
    const topShowAndTellUsers = await prisma.showAndTellEntry.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        approvedAt: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get user details
    const userIds = topShowAndTellUsers
      .map((u) => u.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return topShowAndTellUsers
      .map((entry) => {
        if (!entry.userId) return null;
        const user = usersMap.get(entry.userId);
        if (!user) return null;
        return {
          userId: entry.userId,
          userName: user.name,
          userImage: user.image,
          postCount: entry._count.id,
        };
      })
      .filter((u): u is NonNullable<typeof u> => u !== null);
  }),
});
