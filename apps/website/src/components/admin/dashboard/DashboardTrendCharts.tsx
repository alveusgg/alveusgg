import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { trpc } from "@/utils/trpc";

import { DashboardQueryError } from "@/components/admin/dashboard/DashboardQueryError";

const nf = new Intl.NumberFormat();
const cf = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export function DashboardTrendCharts() {
  const [days, setDays] = useState(30);
  const chartData = trpc.adminDashboard.getChartData.useQuery(
    { days },
    {
      refetchInterval: 5 * 60_000,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  );

  if (!chartData.data) {
    if (chartData.isError) {
      return (
        <DashboardQueryError
          section="trends"
          retry={() => void chartData.refetch()}
        />
      );
    }

    return <p className="text-gray-400">Loading trends...</p>;
  }

  // Check if user has permission to view certain data
  const hasShowAndTellData = chartData.data.some(
    (day) => day.showAndTell !== null,
  );
  const hasDonationData = chartData.data.some((day) => day.donations !== null);

  if (!hasShowAndTellData && !hasDonationData) return null;

  // Calculate totals
  const totalDonations = hasDonationData
    ? chartData.data.reduce((sum, d) => sum + (d.donations || 0), 0)
    : 0;
  const totalDonationAmount = hasDonationData
    ? chartData.data.reduce((sum, d) => sum + (d.donationAmount || 0), 0)
    : 0;
  const totalShowAndTell = chartData.data.reduce(
    (sum, d) => sum + (d.showAndTell || 0),
    0,
  );

  // Format data for Recharts
  const chartDataFormatted = chartData.data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    donations: d.donations,
    donationAmount: d.donationAmount === null ? null : d.donationAmount / 100, // Convert cents to dollars, keeping zero-donation days
    showAndTell: d.showAndTell,
  }));

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Trends</h3>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Time range"
        >
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={`rounded-sm px-3 py-1 text-sm transition-colors ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {d}d<span className="sr-only"> (last {d} days)</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Donations Chart - Dual Y-Axis */}
        {hasDonationData && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true">💝</span> Donations
                </h4>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                  <div>
                    <span className="text-lg font-bold text-pink-400">
                      {nf.format(totalDonations)}
                    </span>{" "}
                    donations
                  </div>
                  <div>
                    <span className="text-lg font-bold text-green-400">
                      {cf.format(totalDonationAmount / 100)}
                    </span>{" "}
                    raised
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="size-3 rounded-full bg-pink-500"></div>
                  Count
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-3 rounded-full bg-green-500"></div>
                  Amount
                </div>
              </div>
            </div>
            {totalDonations === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-sm border border-dashed border-gray-600 bg-gray-900/50 text-sm text-gray-400">
                No donations in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#22c55e"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#ec4899"
                    style={{ fontSize: "12px" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#fff",
                    }}
                    formatter={(value, name) => {
                      if (name === "donationAmount") {
                        return [cf.format(Number(value)), "Amount"];
                      }
                      return [value, "Count"];
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="donationAmount"
                    fill="#22c55e"
                    opacity={0.3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="donations"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 text-center text-xs text-gray-400">
              Last {days} days
            </div>
          </div>
        )}

        {/* Show & Tell Chart */}
        {hasShowAndTellData && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <div className="mb-4">
              <h4 className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true">📸</span> Show & Tell Activity
              </h4>
              <div className="mt-2 text-sm text-gray-400">
                <span className="text-lg font-bold text-green-400">
                  {nf.format(totalShowAndTell)}
                </span>{" "}
                posts
              </div>
            </div>
            {totalShowAndTell === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-sm border border-dashed border-gray-600 bg-gray-900/50 text-sm text-gray-400">
                No posts in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#fff",
                    }}
                    formatter={(value) => [value, "Posts"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="showAndTell"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="#22c55e"
                    fillOpacity={0.1}
                    dot={{ fill: "#22c55e", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 text-center text-xs text-gray-400">
              Last {days} days
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
