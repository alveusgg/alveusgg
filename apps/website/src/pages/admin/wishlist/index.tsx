/**
 * apps/website/src/pages/admin/wishlist/index.tsx
 *
 * Admin panel for the Alveus wishlist.
 * Follows alveusgg admin layout conventions (AdminPageLayout, etc.).
 */

import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { trpc } from "../../../utils/trpc";
import AdminPageLayout from "../../../components/AdminPageLayout";
import WishlistItemForm from "../../../components/wishlist/WishlistItemForm";
import WishlistAdminTable from "../../../components/wishlist/WishlistAdminTable";
import CategoryManager from "../../../components/wishlist/CategoryManager";

type Tab = "items" | "categories";

const AdminWishlistPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemsQuery = trpc.wishlist.adminGetAllItems.useQuery({});
  const categoriesQuery = trpc.wishlist.getCategories.useQuery();

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    void itemsQuery.refetch();
  }, [itemsQuery]);

  const editingItem = editingId
    ? itemsQuery.data?.find((i) => i.id === editingId)
    : undefined;

  return (
    <AdminPageLayout title="Wishlist">
      <Head>
        <title>Wishlist | Alveus Admin</title>
      </Head>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage items needed for Alveus ambassadors and sanctuary operations.
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {(["items", "categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-green-700 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "items" && (
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

      {/* Slide-over form */}
      {showForm && (
        <WishlistItemForm
          item={editingItem}
          categories={categoriesQuery.data ?? []}
          onClose={handleClose}
        />
      )}
    </AdminPageLayout>
  );
};

export default AdminWishlistPage;
