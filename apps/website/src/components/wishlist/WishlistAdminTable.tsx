import type { WishlistCategory, WishlistItem } from "@alveusgg/database";

import { trpc } from "@/utils/trpc";

import Link from "@/components/content/Link";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconArchive from "@/icons/IconArchive";
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

const formatDollars = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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
            return (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="p-1">
                  <div className="text-lg">{item.title}</div>
                  {!isGoal && item.price && (
                    <div className="text-sm text-gray-400">{item.price}</div>
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
                  {isGoal && item.goalAmountCents != null
                    ? `${formatDollars(item.raisedAmountCents)} / ${formatDollars(item.goalAmountCents)}`
                    : `${item.quantityFulfilled}/${item.quantity}`}
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
                  <Button
                    size="small"
                    width="auto"
                    className={secondaryButtonClasses}
                    confirmationMessage="Archive this item? It will be hidden from the public wishlist."
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
