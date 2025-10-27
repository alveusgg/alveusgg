import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { getPostsCount, getUsersCount } from "@/server/db/show-and-tell";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { checkPermissions } from "@/server/utils/auth";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.viewDashboard),
);

export const adminDashboardRouter = router({
  getOverviewStats: permittedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    // Check permissions for user stats
    const canViewUsers = checkPermissions(
      permissions.manageUsersAndRoles,
      user,
    );

    // Gather various statistics in parallel
    const [
      totalUsers,
      totalShowAndTellPosts,
      totalShowAndTellUsers,
      totalNotifications,
      totalPushSubscriptions,
      totalFormEntries,
      totalCalendarEvents,
      totalShortLinks,
    ] = await Promise.all([
      // Total users - only if user has permission
      canViewUsers ? prisma.user.count() : Promise.resolve(null),

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
    ]);

    return {
      totalUsers,
      totalShowAndTellPosts,
      totalShowAndTellUsers,
      totalNotifications,
      totalPushSubscriptions,
      totalFormEntries,
      totalCalendarEvents,
      totalShortLinks,
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
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;

      // Check permissions
      const canViewUsers = checkPermissions(
        permissions.manageUsersAndRoles,
        user,
      );
      const canViewDonations = checkPermissions(
        permissions.manageDonations,
        user,
      );

      const daysAgo = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get daily breakdown of activities
      const [
        usersByDay,
        donationsByDay,
        donationAmountByDay,
        showAndTellByDay,
      ] = await Promise.all([
        // User growth (accounts created per day) - only if user has permission
        canViewUsers
          ? prisma.$queryRaw<
              { date: Date; count: bigint }[]
            >`SELECT DATE(u.emailVerified) as date, COUNT(DISTINCT u.id) as count 
           FROM User u
           WHERE u.emailVerified >= ${daysAgo} AND u.emailVerified IS NOT NULL
           GROUP BY DATE(u.emailVerified)
           ORDER BY date ASC`
          : Promise.resolve([]),

        // Donations count per day - only if user has permission
        canViewDonations
          ? prisma.$queryRaw<
              { date: Date; count: bigint }[]
            >`SELECT DATE(receivedAt) as date, COUNT(*) as count 
           FROM Donation 
           WHERE receivedAt >= ${daysAgo}
           GROUP BY DATE(receivedAt)
           ORDER BY date ASC`
          : Promise.resolve([]),

        // Donation amounts per day - only if user has permission
        canViewDonations
          ? prisma.$queryRaw<
              { date: Date; total: bigint }[]
            >`SELECT DATE(receivedAt) as date, SUM(amount) as total 
           FROM Donation 
           WHERE receivedAt >= ${daysAgo}
           GROUP BY DATE(receivedAt)
           ORDER BY date ASC`
          : Promise.resolve([]),

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
        users: number | null;
        donations: number | null;
        donationAmount: number | null;
        showAndTell: number;
      }
      const dateMap = new Map<string, ChartDayData>();
      for (let i = 0; i < input.days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        if (dateStr) {
          dateMap.set(dateStr, {
            date: dateStr,
            users: canViewUsers ? 0 : null,
            donations: canViewDonations ? 0 : null,
            donationAmount: canViewDonations ? 0 : null,
            showAndTell: 0,
          });
        }
      }

      // Populate with actual data
      if (canViewUsers) {
        usersByDay.forEach((row) => {
          const dateStr = row.date.toISOString().split("T")[0];
          if (dateStr && dateMap.has(dateStr)) {
            dateMap.get(dateStr)!.users = Number(row.count);
          }
        });
      }

      if (canViewDonations) {
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
      }

      showAndTellByDay.forEach((row) => {
        const dateStr = row.date.toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.showAndTell = Number(row.count);
        }
      });

      return Array.from(dateMap.values()).reverse(); // Oldest to newest
    }),
});
