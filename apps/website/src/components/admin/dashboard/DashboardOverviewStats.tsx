import Link from "next/link";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { trpc } from "@/utils/trpc";

const nf = new Intl.NumberFormat();

export function DashboardOverviewStats() {
  const stats = trpc.adminDashboard.getOverviewStats.useQuery(undefined, {
    refetchInterval: 60_000, // Refresh every 60 seconds (reduced from 30s)
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
      label: "Total Users",
      value: stats.data.totalUsers,
      color: "bg-blue-900",
      icon: "👥",
      link: "/admin/users",
      permission: permissions.manageUsersAndRoles,
    },
    {
      label: "Show & Tell Posts",
      value: stats.data.totalShowAndTellPosts,
      color: "bg-green-900",
      icon: "📸",
      link: "/admin/show-and-tell",
      permission: permissions.manageShowAndTell,
    },
    {
      label: "Show & Tell Contributors",
      value: stats.data.totalShowAndTellUsers,
      color: "bg-green-800",
      icon: "✨",
      link: "/admin/show-and-tell",
      permission: permissions.manageShowAndTell,
    },
    {
      label: "Notifications Sent",
      value: stats.data.totalNotifications,
      color: "bg-purple-900",
      icon: "🔔",
      link: "/admin/notifications",
      permission: permissions.manageNotifications,
    },
    {
      label: "Push Subscriptions",
      value: stats.data.totalPushSubscriptions,
      color: "bg-indigo-900",
      icon: "📱",
      link: "/admin/notifications",
      permission: permissions.manageNotifications,
    },
    {
      label: "Form Entries",
      value: stats.data.totalFormEntries,
      color: "bg-orange-900",
      icon: "📝",
      link: "/admin/forms",
      permission: permissions.manageForms,
    },
    {
      label: "Bingo Entries",
      value: stats.data.totalBingoEntries,
      color: "bg-pink-900",
      icon: "🎯",
      link: "/admin/bingo",
      permission: permissions.manageBingos,
    },
    {
      label: "Upcoming Events",
      value: stats.data.totalCalendarEvents,
      color: "bg-teal-900",
      icon: "📅",
      link: "/admin/calendar-events",
      permission: permissions.manageCalendarEvents,
    },
    {
      label: "Short Links",
      value: stats.data.totalShortLinks,
      color: "bg-cyan-900",
      icon: "🔗",
      link: "/admin/short-links",
      permission: permissions.manageShortLinks,
    },
    {
      label: "Donations (30d)",
      value: stats.data.totalDonations,
      color: "bg-yellow-900",
      icon: "💝",
      link: null, // No admin page for donations
      permission: null,
    },
    {
      label: "New Subscriptions (7d)",
      value: stats.data.recentSignups,
      color: "bg-emerald-900",
      icon: "🆕",
      link: null, // Metric only
      permission: null,
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
          const content = (
            <div
              className={`rounded-xl border border-black/80 ${card.color} p-4 transition-transform ${card.link ? "cursor-pointer hover:scale-105" : ""}`}
            >
              <div className="flex items-center justify-between">
                <strong className="block text-3xl">
                  {nf.format(card.value)}
                </strong>
                <span className="text-2xl">{card.icon}</span>
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
