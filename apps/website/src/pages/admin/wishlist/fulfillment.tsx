/**
 * apps/website/src/pages/admin/wishlist/fulfillment.tsx
 *
 * Staff "Fulfillment & Unboxing" dashboard — covers diagram steps 17–24:
 *   - Fully-funded items ready to purchase, with a one-click Amazon cart link
 *   - Donor messages to read aloud on stream
 *   - "Mark as Opened" once the item physically arrives and is unboxed
 */

import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import AdminPageLayout from "../../../components/AdminPageLayout";

const FulfillmentPage: NextPage = () => {
  const [tab, setTab] = useState<"funded" | "messages">("funded");

  const fundedQuery = trpc.wishlist.adminGetFullyFundedProducts.useQuery();
  const messagesQuery = trpc.wishlist.adminGetDonations.useQuery({ unreadMessagesOnly: true });
  const markOpened = trpc.wishlist.markAsOpened.useMutation();
  const markRead = trpc.wishlist.markMessageRead.useMutation();

  const handleMarkOpened = async (id: string) => {
    await markOpened.mutateAsync({ id });
    void fundedQuery.refetch();
  };

  const handleMarkRead = async (donationOrderId: string) => {
    await markRead.mutateAsync({ donationOrderId });
    void messagesQuery.refetch();
  };

  return (
    <AdminPageLayout title="Fulfillment">
      <Head><title>Fulfillment | Alveus Admin</title></Head>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fulfillment &amp; Unboxing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Purchase fully-funded items and read donor messages on stream
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setTab("funded")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "funded" ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Fully funded ({fundedQuery.data?.items.length ?? 0})
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "messages" ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Unread donor messages ({messagesQuery.data?.length ?? 0})
          </button>
        </nav>
      </div>

      {tab === "funded" && (
        <>
          {fundedQuery.data?.amazonCartUrl && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">
                  {fundedQuery.data.items.filter(i => i.url?.includes("amazon.")).length} item(s) ready on Amazon
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  One click adds all of them to your Amazon cart at once
                </p>
              </div>
              <a
                href={fundedQuery.data.amazonCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex-shrink-0"
              >
                Open pre-filled cart →
              </a>
            </div>
          )}

          {fundedQuery.isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : fundedQuery.data?.items.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No fully-funded items waiting on purchase right now.</p>
          ) : (
            <div className="space-y-2">
              {fundedQuery.data?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.category?.name ?? "Uncategorized"} · {item.price ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        View item
                      </a>
                    )}
                    <button
                      onClick={() => void handleMarkOpened(item.id)}
                      disabled={markOpened.isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
                    >
                      Mark as opened ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "messages" && (
        <>
          {messagesQuery.isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : messagesQuery.data?.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No unread donor messages. All caught up!</p>
          ) : (
            <div className="space-y-3">
              {messagesQuery.data?.map((d) => (
                <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {d.donorName ?? "Anonymous"} · <span className="text-green-700">${(d.capturedAmount ?? d.amount).toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-400">for {d.wishlistItem?.title}</p>
                    </div>
                    <button
                      onClick={() => void handleMarkRead(d.id)}
                      disabled={markRead.isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      Mark as read on stream
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">
                    &ldquo;{d.donorMessage}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminPageLayout>
  );
};

export default FulfillmentPage;
