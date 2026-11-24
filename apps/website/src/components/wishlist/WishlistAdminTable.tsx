import type { WishlistCategory, WishlistItem } from "@alveusgg/database";

import { trpc } from "@/utils/trpc";
import {
  formatPrice,
  getPartialTargetCents,
  getWishlistArchiveConfirmation,
  isFullPriceDonatable,
  parsePriceCents,
} from "@/utils/wishlist";

import Link from "@/components/content/Link";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconArchive from "@/icons/IconArchive";
import IconDollar from "@/icons/IconDollar";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

type ItemWithCategory = WishlistItem & { category: WishlistCategory | null };

interface Props {
  items: ItemWithCategory[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

const formatLabel = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

export default function WishlistAdminTable({
  items,
  isLoading,
  onEdit,
  onRefresh,
}: Props) {
  const deleteItem = trpc.adminWishlist.deleteItem.useMutation({
    onSettled: onRefresh,
  });

  if (isLoading) return <MessageBox>Loading …</MessageBox>;

  if (items.length === 0) {
    return (
      <MessageBox>No wishlist items yet. Add one to get started.</MessageBox>
    );
  }

  return (
    <>
      {deleteItem.error && (
        <MessageBox variant="failure" className="mb-4">
          <ProcedureErrorMessage error={deleteItem.error} />
        </MessageBox>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left">Item</th>
            <th className="text-left">Type</th>
            <th className="text-left">Category</th>
            <th className="text-left">Priority</th>
            <th className="text-left">Status</th>
            <th className="text-left">Progress</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isGoal = item.itemType === "GOAL";
            const targetCents = isGoal
              ? item.goalAmountCents
              : item.allowPartialDonations
                ? getPartialTargetCents(item)
                : null;
            const priceCents = isGoal ? null : parsePriceCents(item.price);
            return (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="p-1">
                  <div className="text-lg">{item.title}</div>
                  {!isGoal && item.price && (
                    <div className="text-sm text-gray-400">
                      {priceCents != null
                        ? `${formatPrice(priceCents)}${isFullPriceDonatable(item) ? "" : " (outside checkout limits)"}`
                        : `${item.price} (unreadable price)`}
                    </div>
                  )}
                  {!isGoal && item.url && (
                    <Link href={item.url} external className="text-sm">
                      Product link
                    </Link>
                  )}
                </td>
                <td className="p-1">{isGoal ? "Goal" : "Product"}</td>
                <td className="p-1">
                  {item.category ? (
                    <>
                      {item.category.name}
                      {item.category.archivedAt && " (archived)"}
                    </>
                  ) : (
                    "None"
                  )}
                </td>
                <td className="p-1">{formatLabel(item.priority)}</td>
                <td className="p-1">{formatLabel(item.status)}</td>
                <td className="p-1">
                  {targetCents != null
                    ? `${formatPrice(item.raisedAmountCents)} / ${formatPrice(targetCents)} raised`
                    : `${item.quantityFulfilled}/${item.quantity}`}
                  {item.allowPartialDonations && (
                    <div className="text-sm text-gray-400">
                      Partial donations on
                      {!isGoal && targetCents == null && " (no target)"}
                    </div>
                  )}
                </td>
                <td className="flex flex-row flex-wrap gap-2 p-1">
                  <Button
                    size="small"
                    width="auto"
                    onClick={() => onEdit(item.id)}
                  >
                    <IconPencil className="size-4" />
                    Edit
                  </Button>
                  <LinkButton
                    size="small"
                    width="auto"
                    href={`/admin/wishlist/donations?itemId=${encodeURIComponent(item.id)}`}
                  >
                    <IconDollar className="size-4" />
                    Donations
                  </LinkButton>
                  <Button
                    size="small"
                    width="auto"
                    className={secondaryButtonClasses}
                    confirmationMessage={getWishlistArchiveConfirmation(
                      item.raisedAmountCents,
                    )}
                    onClick={() =>
                      deleteItem.mutate({ id: item.id, permanent: false })
                    }
                  >
                    <IconArchive className="size-4" />
                    Archive
                  </Button>
                  <Button
                    size="small"
                    width="auto"
                    className={dangerButtonClasses}
                    confirmationMessage="Permanently delete this item? This cannot be undone."
                    onClick={() =>
                      deleteItem.mutate({ id: item.id, permanent: true })
                    }
                  >
                    <IconTrash className="size-4" />
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
