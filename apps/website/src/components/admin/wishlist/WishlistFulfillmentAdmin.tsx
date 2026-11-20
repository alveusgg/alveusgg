import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Link from "@/components/content/Link";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  approveButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconAmazon from "@/icons/IconAmazon";
import IconCheck from "@/icons/IconCheck";

export function WishlistFulfillmentAdmin() {
  const fundedQuery = trpc.adminWishlist.adminGetFullyFundedProducts.useQuery();
  const messagesQuery = trpc.adminWishlist.adminGetDonations.useInfiniteQuery(
    { status: "CAPTURED", unreadMessagesOnly: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const markOpened = trpc.adminWishlist.markAsOpened.useMutation({
    onSettled: () => void fundedQuery.refetch(),
  });
  const markRead = trpc.adminWishlist.markMessageRead.useMutation({
    onSettled: () => void messagesQuery.refetch(),
  });

  const funded = fundedQuery.data?.items ?? [];
  const messages =
    messagesQuery.data?.pages.flatMap((page) => page.donations) ?? [];

  return (
    <>
      <Headline>Fully funded, ready to buy ({funded.length})</Headline>

      <Panel>
        {markOpened.error && (
          <MessageBox variant="failure" className="mb-4">
            <ProcedureErrorMessage error={markOpened.error} />
          </MessageBox>
        )}

        {fundedQuery.data?.amazonCartUrl && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p>
              {funded.filter((i) => i.url?.includes("amazon.")).length} item(s)
              can be added to an Amazon cart in one click.
            </p>
            <Link
              href={fundedQuery.data.amazonCartUrl}
              external
              className="flex items-center gap-1"
            >
              <IconAmazon className="size-4" />
              Open pre-filled cart
            </Link>
          </div>
        )}

        {fundedQuery.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : funded.length === 0 ? (
          <MessageBox>
            No fully funded items waiting on purchase right now.
          </MessageBox>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left">Item</th>
                <th className="text-left">Category</th>
                <th className="text-left">Price</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {funded.map((item) => (
                <tr key={item.id} className="border-b border-gray-700">
                  <td className="p-1">
                    <div className="text-lg">{item.title}</div>
                    {item.url && (
                      <Link href={item.url} external className="text-sm">
                        View item
                      </Link>
                    )}
                  </td>
                  <td className="p-1">
                    {item.category?.name ?? "Uncategorized"}
                  </td>
                  <td className="p-1">{item.price ?? "Not set"}</td>
                  <td className="p-1">
                    <Button
                      size="small"
                      width="auto"
                      className={approveButtonClasses}
                      disabled={markOpened.isPending}
                      onClick={() => markOpened.mutate({ id: item.id })}
                    >
                      <IconCheck className="size-4" />
                      Mark as opened
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Headline>
        Unread donor messages ({messages.length}
        {messagesQuery.hasNextPage ? "+" : ""})
      </Headline>

      <Panel>
        {markRead.error && (
          <MessageBox variant="failure" className="mb-4">
            <ProcedureErrorMessage error={markRead.error} />
          </MessageBox>
        )}

        {messagesQuery.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : messages.length === 0 ? (
          <MessageBox>No unread donor messages. All caught up!</MessageBox>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((d) => (
              <li key={d.id} className="border-b border-gray-700 pb-4">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {d.donorName ?? "Anonymous"}, $
                      {(d.capturedAmount ?? d.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      for {d.wishlistItem.title}
                    </p>
                  </div>
                  <Button
                    size="small"
                    width="auto"
                    className={secondaryButtonClasses}
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate({ donationOrderId: d.id })}
                  >
                    Mark as read on stream
                  </Button>
                </div>
                <blockquote className="italic">
                  &ldquo;{d.donorMessage}&rdquo;
                </blockquote>
              </li>
            ))}
          </ul>
        )}

        {messagesQuery.hasNextPage && (
          <div className="mt-4">
            <Button
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => void messagesQuery.fetchNextPage()}
            >
              {messagesQuery.isFetchingNextPage ? "Loading …" : "Load more"}
            </Button>
          </div>
        )}
      </Panel>
    </>
  );
}
