import { useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { Button, defaultButtonClasses, secondaryButtonClasses } from "@/components/shared/form/Button";

import IconAmazon from "@/icons/IconAmazon";
import IconExternal from "@/icons/IconExternal";

export function WishlistFulfillmentAdmin() {
  const [tab, setTab] = useState<"funded" | "messages">("funded");

  const fundedQuery = trpc.adminWishlist.adminGetFullyFundedProducts.useQuery();
  const messagesQuery = trpc.adminWishlist.adminGetDonations.useQuery({ status: "CAPTURED", unreadMessagesOnly: true });
  const markOpened = trpc.adminWishlist.markAsOpened.useMutation();
  const markRead = trpc.adminWishlist.markMessageRead.useMutation();

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setTab("funded")}
            className={classes(
              "pb-3 text-sm font-medium border-b-2 transition-colors",
              tab === "funded"
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Fully funded ({fundedQuery.data?.items.length ?? 0})
          </button>
          <button
            onClick={() => setTab("messages")}
            className={classes(
              "pb-3 text-sm font-medium border-b-2 transition-colors",
              tab === "messages"
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
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
                  {fundedQuery.data.items.filter((i) => i.url?.includes("amazon.")).length} item(s) ready on Amazon
                </p>
                <p className="text-xs text-orange-700 mt-0.5">One click adds all of them to your Amazon cart at once</p>
              </div>
              <a
                href={fundedQuery.data.amazonCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex-shrink-0"
              >
                <IconAmazon className="size-4" />
                Open pre-filled cart
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
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.category?.name ?? "Uncategorized"} · {item.price ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <IconExternal className="size-3.5" />
                        View item
                      </a>
                    )}
                    <Button
                      type="button"
                      size="small"
                      width="auto"
                      className={defaultButtonClasses}
                      disabled={markOpened.isLoading}
                      onClick={() =>
                        markOpened.mutate({ id: item.id }, { onSuccess: () => void fundedQuery.refetch() })
                      }
                    >
                      Mark as opened
                    </Button>
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
                    <Button
                      type="button"
                      size="small"
                      width="auto"
                      className={secondaryButtonClasses}
                      disabled={markRead.isLoading}
                      onClick={() =>
                        markRead.mutate({ donationOrderId: d.id }, { onSuccess: () => void messagesQuery.refetch() })
                      }
                    >
                      Mark as read on stream
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">&ldquo;{d.donorMessage}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
