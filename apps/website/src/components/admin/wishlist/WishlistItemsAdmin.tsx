import { useCallback, useState } from "react";

import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import {
  Button,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import WishlistAdminTable from "@/components/wishlist/WishlistAdminTable";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";

import IconPlus from "@/icons/IconPlus";

export function WishlistItemsAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemsQuery = trpc.adminWishlist.adminGetAllItems.useQuery({});
  const categoriesQuery = trpc.adminWishlist.adminGetAllCategories.useQuery();

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    void itemsQuery.refetch();
  }, [itemsQuery]);

  const editingItem = editingId
    ? itemsQuery.data?.find((i) => i.id === editingId)
    : undefined;

  // Archived categories are hidden from the dropdown, but an item already
  // in one keeps it as an option so saving doesn't drop the link.
  const categories = (categoriesQuery.data ?? []).filter(
    (category) =>
      !category.archivedAt || category.id === editingItem?.categoryId,
  );

  return (
    <>
      <Headline>Wishlist items</Headline>

      {showForm ? (
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingItem ? "Edit item" : "Add item"}
            </h3>
            <Button
              size="small"
              width="auto"
              className={secondaryButtonClasses}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
          <WishlistItemForm
            key={editingItem?.id ?? "create"}
            action={editingItem ? "edit" : "create"}
            item={editingItem}
            categories={categories}
            onCreate={handleCreateSuccess}
          />
        </Panel>
      ) : (
        <Panel>
          <p className="mb-4 text-sm text-gray-400">
            Manage items needed for Alveus ambassadors and sanctuary operations.
            Donors contribute through PayPal and staff buy the items.
          </p>

          <WishlistAdminTable
            items={itemsQuery.data ?? []}
            isLoading={itemsQuery.isPending}
            onEdit={handleEdit}
            onRefresh={() => void itemsQuery.refetch()}
          />

          <div className="mt-4 flex">
            <Button
              size="small"
              width="auto"
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <IconPlus className="size-4" />
              Add item
            </Button>
          </div>
        </Panel>
      )}
    </>
  );
}
