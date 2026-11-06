/**
 * apps/website/src/pages/admin/wishlist/donations.tsx
 *
 * Admin view of all wishlist donation orders — PayPal status, Neon CRM sync,
 * and fulfillment tracking in one place.
 */

import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import AdminPageLayout from "../../../components/AdminPageLayout";

const STATUS_BADGE: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-800",
  CAPTURED: "bg-green-100 text-green-800",
  FAILED:   "bg-red-100 text-red-800",
};

const AdminWishlistDonationsPage: NextPage = () => {
  const donationsQuery = trpc.wishlist.adminGetDonations.useQuery({});

  const donations = donationsQuery.data ?? [];
  const total = donations
    .filter((d) => d.status === "CAPTURED")
    .reduce((sum, d) => sum + (d.capturedAmount ?? d.amount), 0);

  return (
    <AdminPageLayout title="Wishlist Donations">
      <Head>
        <title>Wishlist Donations | Alveus Admin</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist Donations</h1>
          <p className="text-sm text-gray-500 mt-1">
            PayPal orders and Neon CRM sync status
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-700">${total.toFixed(2)}</p>
          <p className="text-xs text-gray-400">total captured</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total donations", value: donations.length, color: "text-gray-900" },
          { label: "Captured", value: donations.filter(d => d.status === "CAPTURED").length, color: "text-green-700" },
          { label: "Pending", value: donations.filter(d => d.status === "PENDING").length, color: "text-yellow-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {donationsQuery.isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">No donations yet.</p>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Donor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">PayPal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Neon CRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.donorName ?? "Anonymous"}</p>
                    {d.donorEmail && (
                      <p className="text-xs text-gray-400">{d.donorEmail}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                    {d.wishlistItem?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${(d.capturedAmount ?? d.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[d.status] ?? ""}`}>
                      {d.status === "CAPTURED" ? "✓ Captured" : d.status}
                    </span>
                    {d.paypalTransactionId && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {d.paypalTransactionId.slice(0, 12)}…
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.neonDonationId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Logged #{d.neonDonationId}
                      </span>
                    ) : d.status === "CAPTURED" ? (
                      <span className="text-xs text-yellow-600">Pending sync</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminWishlistDonationsPage;
