/**
 * apps/website/src/components/wishlist/WishlistItemForm.tsx
 *
 * Slide-over form for adding/editing a wishlist item.
 * v2: supports both PRODUCT items (URL auto-fill) and GOAL items (custom
 * funding target with no linked product). Item type is chosen once at
 * creation and locked during edits to avoid data-shape mismatches.
 */

import { useState, useEffect, useRef } from "react";
import type { WishlistItem, WishlistCategory } from "@prisma/client";
import { trpc } from "../../utils/trpc";

type ItemWithCategory = WishlistItem & { category: WishlistCategory | null };

interface Props {
  item?: ItemWithCategory;
  categories: Array<WishlistCategory & { _count: { items: number } }>;
  onClose: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const STATUS_OPTIONS = [
  { value: "NEEDED", label: "Needed" },
  { value: "PARTIALLY_FULFILLED", label: "Partially Fulfilled" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "OPENED", label: "Opened" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function WishlistItemForm({ item, categories, onClose }: Props) {
  const isEditing = !!item;

  // Item type is fixed once set — locked during edits
  const [itemType, setItemType] = useState<"PRODUCT" | "GOAL">(item?.itemType ?? "PRODUCT");

  // Shared fields
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [priority, setPriority] = useState(item?.priority ?? "MEDIUM");
  const [status, setStatus] = useState(item?.status ?? "NEEDED");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  // PRODUCT-only fields
  const [url, setUrl] = useState(item?.url ?? "");
  const [price, setPrice] = useState(item?.price ?? "");
  const [quantity, setQuantity] = useState(item?.quantity ?? 1);
  const [quantityFulfilled, setQuantityFulfilled] = useState(item?.quantityFulfilled ?? 0);

  // GOAL-only fields (stored as dollars in the UI, converted to cents on save)
  const [goalAmount, setGoalAmount] = useState(
    item?.goalAmountCents != null ? String(item.goalAmountCents / 100) : "500"
  );
  const [raisedAmount, setRaisedAmount] = useState(
    item?.raisedAmountCents != null ? String(item.raisedAmountCents / 100) : "0"
  );

  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMeta = trpc.wishlist.fetchUrlMeta.useQuery(
    { url },
    { enabled: false, retry: false }
  );

  const createItem = trpc.wishlist.createItem.useMutation();
  const updateItem = trpc.wishlist.updateItem.useMutation();

  // Auto-fetch metadata when URL is pasted/changed (PRODUCT mode only)
  useEffect(() => {
    if (itemType !== "PRODUCT" || !url || isEditing) return;

    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);

    urlDebounceRef.current = setTimeout(async () => {
      try {
        new URL(url);
      } catch {
        return;
      }

      setFetchingMeta(true);
      setMetaFetched(false);

      const result = await fetchMeta.refetch();
      if (result.data) {
        const meta = result.data;
        if (meta.title && !title) setTitle(meta.title);
        if (meta.description && !description) setDescription(meta.description);
        if (meta.imageUrl && !imageUrl) setImageUrl(meta.imageUrl);
        if (meta.price && !price) setPrice(meta.price);
        setMetaFetched(true);
      }
      setFetchingMeta(false);
    }, 800);

    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, itemType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const shared = {
      title,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status: status as "NEEDED" | "PARTIALLY_FULFILLED" | "FULFILLED" | "OPENED" | "ARCHIVED",
      categoryId: categoryId || undefined,
      notes: notes || undefined,
    };

    try {
      if (itemType === "PRODUCT") {
        const payload = {
          itemType: "PRODUCT" as const,
          ...shared,
          url,
          price: price || undefined,
          quantity,
          quantityFulfilled,
        };
        if (isEditing && item) {
          await updateItem.mutateAsync({ id: item.id, ...payload });
        } else {
          await createItem.mutateAsync(payload);
        }
      } else {
        const amountCents = Math.round((parseFloat(goalAmount) || 0) * 100);
        const raisedCents = Math.round((parseFloat(raisedAmount) || 0) * 100);
        const payload = {
          itemType: "GOAL" as const,
          ...shared,
          goalAmountCents: amountCents > 0 ? amountCents : 100,
        };
        if (isEditing && item) {
          // raisedAmountCents can be manually adjusted by an admin during edit
          await updateItem.mutateAsync({ id: item.id, ...payload, raisedAmountCents: raisedCents });
        } else {
          await createItem.mutateAsync(payload);
        }
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isSaving = createItem.isLoading || updateItem.isLoading;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden />

      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? `Edit ${itemType === "GOAL" ? "Goal" : "Item"}` : "Add Wishlist Item"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Item type toggle — only shown when creating, locked during edit */}
          {!isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setItemType("PRODUCT")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  itemType === "PRODUCT"
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-green-700 border-gray-300"
                }`}
              >
                🔗 Product URL
              </button>
              <button
                type="button"
                onClick={() => setItemType("GOAL")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  itemType === "GOAL"
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-green-700 border-gray-300"
                }`}
              >
                🎯 Funding Goal
              </button>
            </div>
          )}

          {itemType === "PRODUCT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 pr-8"
                />
                {fetchingMeta && (
                  <span className="absolute right-2 top-2.5">
                    <svg className="w-4 h-4 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                )}
              </div>
              {metaFetched && (
                <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Details auto-filled from product page
                </p>
              )}
            </div>
          )}

          {/* Image preview + URL (shared) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={itemType === "PRODUCT" ? "Will be auto-fetched from product page" : "https://…"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 mt-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={itemType === "GOAL" ? "e.g. New Outdoor Enclosure Fund" : "Product name"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={itemType === "GOAL" ? "What will this funding be used for?" : "Why does Alveus need this?"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
          </div>

          {itemType === "PRODUCT" ? (
            <>
              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="$29.99"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Fulfilled</label>
                  <input
                    type="number"
                    min={0}
                    max={quantity}
                    value={quantityFulfilled}
                    onChange={(e) => setQuantityFulfilled(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Goal amount + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raised so far — only meaningful once the goal already has donations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raised So Far (USD) <span className="text-gray-400 font-normal">(usually managed automatically by donations)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={raisedAmount}
                    onChange={(e) => setRaisedAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Priority + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes <span className="text-gray-400 font-normal">(not shown publicly)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Admin notes, preferred vendor, etc."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={(e) => void handleSubmit(e as unknown as React.FormEvent)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving…" : isEditing ? "Save Changes" : itemType === "GOAL" ? "Add Funding Goal" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </>
  );
}
