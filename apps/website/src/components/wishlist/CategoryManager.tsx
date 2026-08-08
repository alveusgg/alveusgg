/**
 * apps/website/src/components/wishlist/CategoryManager.tsx
 */

import { useState } from "react";
import type { WishlistCategory } from "@prisma/client";
import { trpc } from "../../utils/trpc";

type CategoryWithCount = WishlistCategory & { _count: { items: number } };

interface Props {
  categories: CategoryWithCount[];
  onRefresh: () => void;
}

interface FormState {
  name: string;
  slug: string;
  sortOrder: number;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function CategoryManager({ categories, onRefresh }: Props) {
  const [form, setForm] = useState<FormState>({ name: "", slug: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = trpc.wishlist.createCategory.useMutation();
  const update = trpc.wishlist.updateCategory.useMutation();
  const deleteCategory = trpc.wishlist.deleteCategory.useMutation();

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : toSlug(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
      } else {
        await create.mutateAsync(form);
      }
      setForm({ name: "", slug: "", sortOrder: 0 });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder });
  };

  const handleDelete = async (id: string, count: number) => {
    const msg = count > 0
      ? `Delete this category? The ${count} item(s) in it will become uncategorized.`
      : "Delete this category?";
    if (!confirm(msg)) return;
    await deleteCategory.mutateAsync({ id });
    onRefresh();
  };

  const isSaving = create.isLoading || update.isLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Category" : "Add Category"}
        </h3>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Food & Enrichment"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))}
              placeholder="food-enrichment"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving…" : editingId ? "Save" : "Add Category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ name: "", slug: "", sortOrder: 0 }); }}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.slug} · {cat._count.items} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => void handleDelete(cat.id, cat._count.items)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
