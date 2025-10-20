import Link from "next/link";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { trpc } from "@/utils/trpc";

import IconBox from "@/icons/IconBox";
import IconCalendar from "@/icons/IconCalendar";
import IconExternal from "@/icons/IconExternal";
import IconNotification from "@/icons/IconNotification";
import IconNotificationAlert from "@/icons/IconNotificationAlert";
import IconUserGroup from "@/icons/IconUserGroup";
import IconVideoCamera from "@/icons/IconVideoCamera";

const nf = new Intl.NumberFormat();

export function DashboardOverviewStats() {
  const stats = trpc.adminDashboard.getOverviewStats.useQuery(undefined, {
    refetchInterval: 60_000, // Refresh every 60 seconds
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when tab becomes active
  });

  const { data: session } = trpc.auth.getSession.useQuery();
  const userRoles = session?.user?.roles || [];
  const isSuperUser = session?.user?.isSuperUser || false;

  if (!stats.data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-700 bg-gray-800 p-4"
          >
            <div className="h-8 w-20 rounded bg-gray-700"></div>
            <div className="mt-2 h-4 w-24 rounded bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Notifications Sent",
      value: stats.data.totalNotifications,
      Icon: IconNotificationAlert,
      link: "/admin/notifications",
      permission: permissions.manageNotifications,
    },
    {
      label: "Push Subscriptions",
      value: stats.data.totalPushSubscriptions,
      Icon: IconNotification,
      link: "/admin/notifications",
      permission: permissions.manageNotifications,
    },
    {
      label: "Upcoming Events",
      value: stats.data.totalCalendarEvents,
      Icon: IconCalendar,
      link: "/admin/calendar-events",
      permission: permissions.manageCalendarEvents,
    },
    {
      label: "Total Users",
      value: stats.data.totalUsers,
      Icon: IconUserGroup,
      link: "/admin/users",
      permission: permissions.manageUsersAndRoles,
    },
    {
      label: "Show & Tell Posts",
      value: stats.data.totalShowAndTellPosts,
      Icon: IconVideoCamera,
      link: "/admin/show-and-tell",
      permission: permissions.manageShowAndTell,
    },
    {
      label: "Show & Tell Contributors",
      value: stats.data.totalShowAndTellUsers,
      Icon: IconUserGroup,
      link: "/admin/show-and-tell",
      permission: permissions.manageShowAndTell,
    },
    {
      label: "Short Links",
      value: stats.data.totalShortLinks,
      Icon: IconExternal,
      link: "/admin/short-links",
      permission: permissions.manageShortLinks,
    },
    {
      label: "Form Entries",
      value: stats.data.totalFormEntries,
      Icon: IconBox,
      link: "/admin/forms",
      permission: permissions.manageForms,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {cards
        .filter(
          (card) =>
            !card.permission ||
            isSuperUser ||
            checkRolesGivePermission(userRoles, card.permission),
        )
        .map((card) => {
          const { Icon } = card;
          const content = (
            <div className="cursor-pointer rounded-xl border border-gray-700 bg-gray-800 p-4 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <strong className="block text-3xl">
                  {nf.format(card.value)}
                </strong>
                <Icon className="h-8 w-8" />
              </div>
              <p className="mt-1 text-sm opacity-90">{card.label}</p>
            </div>
          );

          return card.link ? (
            <Link key={card.label} href={card.link}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
    </div>
  );
}
