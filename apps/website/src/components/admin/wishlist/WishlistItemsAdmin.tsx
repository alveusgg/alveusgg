import { useState, useCallback } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import WishlistAdminTable from "@/components/wishlist/WishlistAdminTable";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import CategoryManager from "@/components/wishlist/CategoryManager";

type Tab = "items" | "categories";

export function WishlistItemsAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemsQuery = trpc.adminWishlist.adminGetAllItems.useQuery({});
  const categoriesQuery = trpc.wishlist.getCategories.useQuery();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Manage items needed for Alveus ambassadors and sanctuary operations.
        </p>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {(["items", "categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classes(
                "pb-3 text-sm font-medium capitalize border-b-2 transition-colors",
                activeTab === tab
                  ? "border-green-700 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "items" && !showForm && (
        <WishlistAdminTable
          items={itemsQuery.data ?? []}
          isLoading={itemsQuery.isLoading}
          onEdit={handleEdit}
          onRefresh={() => void itemsQuery.refetch()}
        />
      )}
      {activeTab === "categories" && (
        <CategoryManager
          categories={categoriesQuery.data ?? []}
          onRefresh={() => void categoriesQuery.refetch()}
        />
      )}

      {activeTab === "items" && showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingItem ? "Edit item" : "Add item"}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <WishlistItemForm
            action={editingItem ? "edit" : "create"}
            item={editingItem}
            categories={categoriesQuery.data ?? []}
            onCreate={handleCreateSuccess}
          />
        </div>
      )}
    </div>
  );
}
