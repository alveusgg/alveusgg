import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Link from "@/components/content/Link";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button } from "@/components/shared/form/Button";

const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

export function WishlistDonationsAdmin() {
  const router = useRouter();
  const itemId =
    typeof router.query.itemId === "string" ? router.query.itemId : undefined;
  const donationsQuery = trpc.adminWishlist.adminGetDonations.useInfiniteQuery(
    { wishlistItemId: itemId },
    {
      enabled: router.isReady,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const totalsQuery = trpc.adminWishlist.adminGetDonationTotals.useQuery(
    { wishlistItemId: itemId },
    { enabled: router.isReady },
  );

  const donations =
    donationsQuery.data?.pages.flatMap((page) => page.donations) ?? [];
  const totals = totalsQuery.data;

  return (
    <>
      <Headline>Wishlist donations</Headline>

      <Panel>
        {itemId && (
          <p className="mb-2">
            {`Showing donations for ${donations[0]?.wishlistItem.title ?? "one item"}. `}
            <Link href="/admin/wishlist/donations" dark>
              Show all donations
            </Link>
          </p>
        )}
        {totals && (
          <p className="mb-4">
            {formatAmount(totals.capturedAmount)} captured from{" "}
            {totals.captured} of {totals.orders} PayPal orders ({totals.pending}{" "}
            pending)
          </p>
        )}

        {donationsQuery.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : donations.length === 0 ? (
          <MessageBox>No donations yet.</MessageBox>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left">Date</th>
                <th className="text-left">Donor</th>
                <th className="text-left">Item</th>
                <th className="text-left">Amount</th>
                <th className="text-left">PayPal</th>
                <th className="text-left">Neon CRM</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b border-gray-700">
                  <td className="p-1 whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-1">
                    <div>{d.donorName ?? "Anonymous"}</div>
                    {d.donorEmail && (
                      <div className="text-sm text-gray-400">
                        {d.donorEmail}
                      </div>
                    )}
                  </td>
                  <td className="p-1">{d.wishlistItem.title}</td>
                  <td className="p-1">
                    {formatAmount(d.capturedAmount ?? d.amount)}
                    {d.excessAmount != null && d.excessAmount > 0 && (
                      <div className="text-sm text-gray-400">
                        {`${formatAmount(d.excessAmount)} over target, general wishlist`}
                      </div>
                    )}
                  </td>
                  <td className="p-1">
                    <div>{d.status === "CAPTURED" ? "Captured" : d.status}</div>
                    {d.paypalTransactionId && (
                      <div className="font-mono text-sm text-gray-400">
                        {d.paypalTransactionId}
                      </div>
                    )}
                  </td>
                  <td className="p-1">
                    {d.neonDonationId
                      ? `Logged #${d.neonDonationId}`
                      : d.status === "CAPTURED"
                        ? "Not logged"
                        : "Not captured"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {donationsQuery.hasNextPage && (
          <div className="mt-4">
            <Button
              disabled={donationsQuery.isFetchingNextPage}
              onClick={() => void donationsQuery.fetchNextPage()}
            >
              {donationsQuery.isFetchingNextPage ? "Loading …" : "Load more"}
            </Button>
          </div>
        )}
      </Panel>
    </>
  );
}
