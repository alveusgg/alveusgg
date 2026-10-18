import { z } from "zod";

import { type Prisma, prisma } from "@alveusgg/database";

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

export interface ChartDayData {
  date: string;
  donations: number | null;
  donationAmount: number | null;
  showAndTell: number | null;
}

export const adminDashboardRouter = router({
  getOverviewStats: permittedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    // Check permissions for user stats
    const canViewUsers = checkPermissions(
      permissions.manageUsersAndRoles,
      user,
    );
    const canViewShowAndTell = checkPermissions(
      permissions.manageShowAndTell,
      user,
    );
    const canViewNotifications = checkPermissions(
      permissions.manageNotifications,
      user,
    );
    const canViewForms = checkPermissions(permissions.manageForms, user);
    const canViewCalendarEvents = checkPermissions(
      permissions.manageCalendarEvents,
      user,
    );
    const canViewShortLinks = checkPermissions(
      permissions.manageShortLinks,
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
      canViewShowAndTell ? getPostsCount() : null,
      canViewShowAndTell ? getUsersCount() : null,

      // Notifications
      canViewNotifications
        ? prisma.notification.count({
            where: { canceledAt: null },
          })
        : null,

      // Push subscriptions (active only)
      canViewNotifications
        ? prisma.pushSubscription.count({
            where: { deletedAt: null },
          })
        : null,

      // Forms
      canViewForms ? prisma.formEntry.count() : null,

      // Calendar events (future)
      canViewCalendarEvents
        ? prisma.calendarEvent.count({
            where: {
              startAt: {
                gte: new Date(),
              },
            },
          })
        : null,

      // Short links
      canViewShortLinks ? prisma.shortLinks.count() : null,
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

  getRecentActivity: permittedProcedure.query(async ({ ctx }) => {
    const canViewShowAndTell = checkPermissions(
      permissions.manageShowAndTell,
      ctx.session.user,
    );
    const canViewNotifications = checkPermissions(
      permissions.manageNotifications,
      ctx.session.user,
    );
    // Get recent activity across different areas
    const [recentShowAndTell, recentNotifications] = await Promise.all([
      canViewShowAndTell
        ? prisma.showAndTellEntry.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true,
              approvedAt: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          })
        : [],

      canViewNotifications
        ? prisma.notification.findMany({
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
          })
        : [],
    ]);

    return {
      recentShowAndTell,
      recentNotifications,
    };
  }),

  getChartData: permittedProcedure
    .input(
      z.object({
        days: z.number().int().min(7).max(90).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;

      // Check permissions
      const canViewShowAndTell = checkPermissions(
        permissions.manageShowAndTell,
        user,
      );
      const canViewDonations = checkPermissions(
        permissions.manageDonations,
        user,
      );

      if (!canViewShowAndTell && !canViewDonations) return [];

      const daysAgo = new Date();
      daysAgo.setUTCHours(0, 0, 0, 0);
      daysAgo.setUTCDate(daysAgo.getUTCDate() - input.days + 1);

      // Get daily breakdown of activities
      const [donationsByDay, showAndTellByDay] = await Promise.all([
        // Read counts and amounts together so they describe the same donations.
        canViewDonations
          ? prisma.$queryRaw<
              { date: string; count: bigint; total: Prisma.Decimal }[]
            >`SELECT DATE_FORMAT(receivedAt, '%Y-%m-%d') as date,
                COUNT(*) as count, SUM(amount) as total
           FROM Donation
           WHERE receivedAt >= ${daysAgo}
           GROUP BY DATE_FORMAT(receivedAt, '%Y-%m-%d')
           ORDER BY date ASC`
          : Promise.resolve([]),

        // Show and Tell posts per day
        canViewShowAndTell
          ? prisma.$queryRaw<
              { date: string; count: bigint }[]
            >`SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as count
           FROM ShowAndTellEntry
           WHERE createdAt >= ${daysAgo}
           GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
           ORDER BY date ASC`
          : [],
      ]);

      // Fill in missing dates with 0 values
      // (days are UTC, matching the YYYY-MM-DD strings MySQL returns for UTC timestamps)
      const dateMap = new Map<string, ChartDayData>();
      for (let i = 0; i < input.days; i++) {
        const date = new Date(daysAgo);
        date.setUTCDate(date.getUTCDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        if (dateStr) {
          dateMap.set(dateStr, {
            date: dateStr,
            donations: canViewDonations ? 0 : null,
            donationAmount: canViewDonations ? 0 : null,
            showAndTell: canViewShowAndTell ? 0 : null,
          });
        }
      }

      // Populate with actual data
      if (canViewDonations) {
        donationsByDay.forEach((row) => {
          const dateStr = row.date;
          if (dateStr && dateMap.has(dateStr)) {
            dateMap.get(dateStr)!.donations = Number(row.count);
            dateMap.get(dateStr)!.donationAmount = Number(row.total);
          }
        });
      }

      showAndTellByDay.forEach((row) => {
        const dateStr = row.date;
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.get(dateStr)!.showAndTell = Number(row.count);
        }
      });

      return Array.from(dateMap.values()); // Oldest to newest
    }),
});
