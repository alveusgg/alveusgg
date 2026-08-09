import type { WishlistItem, WishlistCategory } from "@alveusgg/database";
import { trpc } from "@/utils/trpc";
import IconPencil from "@/icons/IconPencil";
import IconArchive from "@/icons/IconArchive";
import IconTrash from "@/icons/IconTrash";
import IconExternal from "@/icons/IconExternal";
import IconGift from "@/icons/IconGift";
import IconBox from "@/icons/IconBox";

type ItemWithCategory = WishlistItem & { category: WishlistCategory | null };

interface Props {
  items: ItemWithCategory[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const STATUS_BADGE: Record<string, string> = {
  NEEDED: "bg-yellow-100 text-yellow-800",
  PARTIALLY_FULFILLED: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-green-100 text-green-800",
  OPENED: "bg-purple-100 text-purple-800",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default function WishlistAdminTable({ items, isLoading, onEdit, onRefresh }: Props) {
  const deleteItem = trpc.wishlist.deleteItem.useMutation();

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this item? It will be hidden from the public wishlist.")) return;
    await deleteItem.mutateAsync({ id, permanent: false });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this item? This cannot be undone.")) return;
    await deleteItem.mutateAsync({ id, permanent: true });
    onRefresh();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <IconGift className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No wishlist items yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 w-10">#</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Item</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Progress</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item, idx) => {
            const isGoal = item.itemType === "GOAL";
            return (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <IconGift className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{item.title}</p>
                      {!isGoal && item.price && <p className="text-gray-500 text-xs">{item.price}</p>}
                      {isGoal && <p className="text-gray-400 text-xs">Funding goal</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isGoal ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {isGoal
                      ? <><IconGift className="inline size-3 mr-0.5" /> Goal</>
                      : <><IconBox className="inline size-3 mr-0.5" /> Product</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.category?.name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[item.priority] ?? ""}`}>
                    {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] ?? ""}`}>
                    {item.status === "PARTIALLY_FULFILLED" ? "Partial" : item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {isGoal && item.goalAmountCents != null
                    ? `$${(item.raisedAmountCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} / $${(item.goalAmountCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : `${item.quantityFulfilled}/${item.quantity}`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {!isGoal && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Open product link"
                      >
                        <IconExternal className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(item.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleArchive(item.id)}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                      title="Archive"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete permanently"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
