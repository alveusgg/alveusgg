import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { MessageBox } from "@/components/shared/MessageBox";

const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

export function WishlistDonationsAdmin() {
  const donationsQuery = trpc.adminWishlist.adminGetDonations.useQuery({});

  const donations = donationsQuery.data ?? [];
  const captured = donations.filter((d) => d.status === "CAPTURED");
  const total = captured.reduce(
    (sum, d) => sum + (d.capturedAmount ?? d.amount),
    0,
  );

  return (
    <>
      <Headline>Wishlist donations</Headline>

      <Panel>
        <p className="mb-4">
          {formatAmount(total)} captured from {captured.length} of{" "}
          {donations.length} PayPal orders (
          {donations.filter((d) => d.status === "PENDING").length} pending)
        </p>

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
      </Panel>
    </>
  );
}
