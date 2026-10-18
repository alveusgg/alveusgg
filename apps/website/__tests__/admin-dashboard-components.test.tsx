import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";

import { DashboardOverviewStats } from "@/components/admin/dashboard/DashboardOverviewStats";
import { DashboardRecentActivity } from "@/components/admin/dashboard/DashboardRecentActivity";
import { DashboardTrendCharts } from "@/components/admin/dashboard/DashboardTrendCharts";

const { activity, chartData, queryState, renderedChart } = vi.hoisted(() => ({
  queryState: { isError: false },
  renderedChart: vi.fn(),
  activity: {
    recentShowAndTell: [
      {
        id: "approved",
        title: "Approved post",
        createdAt: new Date("2026-10-15"),
        updatedAt: new Date("2026-10-15"),
        approvedAt: new Date("2026-10-15"),
        user: null,
      },
      {
        id: "edited",
        title: "Edited post",
        createdAt: new Date("2026-10-15"),
        updatedAt: new Date("2026-10-17"),
        approvedAt: new Date("2026-10-15"),
        user: null,
      },
    ],
    recentNotifications: [],
  },
  chartData: [
    { date: "2026-10-17", donations: 2, donationAmount: 500, showAndTell: 1 },
    { date: "2026-10-18", donations: 0, donationAmount: 0, showAndTell: 0 },
  ],
}));

vi.mock("@/utils/trpc", () => ({
  trpc: {
    auth: {
      getSession: {
        useQuery: () => ({ data: { user: { roles: ["showAndTell"] } } }),
      },
    },
    adminDashboard: {
      getOverviewStats: {
        useQuery: () => ({
          data: undefined,
          isError: queryState.isError,
          refetch: vi.fn(),
        }),
      },
      getRecentActivity: {
        useQuery: () => ({
          data: queryState.isError ? undefined : activity,
          isError: queryState.isError,
          refetch: vi.fn(),
        }),
      },
      getChartData: {
        useQuery: () => ({
          data: queryState.isError ? undefined : chartData,
          isError: queryState.isError,
          refetch: vi.fn(),
        }),
      },
    },
  },
}));

vi.mock("recharts", () => {
  const Chart = ({ data }: { data: { date: string }[] }) => {
    renderedChart(data);
    return data.map((day) => day.date).join(",");
  };
  const Empty = () => null;
  return {
    Bar: Empty,
    CartesianGrid: Empty,
    ComposedChart: Chart,
    Line: Empty,
    LineChart: Chart,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
    Tooltip: Empty,
    XAxis: Empty,
    YAxis: Empty,
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  queryState.isError = false;
});

test("edited posts lose the approval checkmark", () => {
  const html = renderToStaticMarkup(<DashboardRecentActivity />);
  expect(html).toContain("Approved post");
  expect(html).toContain("Edited post");
  expect(html.match(/✓/g)).toHaveLength(1);
});

test("chart dates stay on their UTC day in America/Chicago", () => {
  vi.stubEnv("TZ", "America/Chicago");
  expect(new Date("2026-10-17").getDate()).toBe(16);
  const html = renderToStaticMarkup(<DashboardTrendCharts />);
  expect(html).toContain("Oct 17");
  expect(html).not.toContain("Oct 16");
  expect(html).not.toContain("User Growth");
});

test("donation-free days are plotted as zero instead of missing amounts", () => {
  renderToStaticMarkup(<DashboardTrendCharts />);
  expect(renderedChart).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ date: "Oct 17", donationAmount: 5 }),
      expect.objectContaining({ date: "Oct 18", donationAmount: 0 }),
    ]),
  );
});

test.each([
  ["overview statistics", DashboardOverviewStats],
  ["recent activity", DashboardRecentActivity],
  ["trends", DashboardTrendCharts],
] as const)(
  "failed %s requests show an error and retry action",
  (section, Component) => {
    queryState.isError = true;
    const html = renderToStaticMarkup(<Component />);
    expect(html).toContain('role="alert"');
    expect(html).toContain(`Unable to load ${section}.`);
    expect(html).toContain("Try again");
    expect(html).not.toContain("Loading");
  },
);
