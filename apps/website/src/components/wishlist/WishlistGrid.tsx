import type { WishlistItem, WishlistCategory } from "@alveusgg/database";
import WishlistDonateButton from "@/components/wishlist/WishlistDonateButton";
import { classes } from "@/utils/classes";
import IconCheck from "@/icons/IconCheck";
import IconGift from "@/icons/IconGift";
import IconWarningTriangle from "@/icons/IconWarningTriangle";

type ItemWithCategory = WishlistItem & { category: WishlistCategory | null };

interface Props {
  items: ItemWithCategory[];
  loading?: boolean;
}

const PRIORITY_LABEL: Record<string, { label: string; cls: string }> = {
  URGENT: { label: "Urgent",        cls: "bg-red-100 text-red-700 border-red-200" },
  HIGH:   { label: "High Priority", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  MEDIUM: { label: "Needed",        cls: "bg-blue-100 text-blue-700 border-blue-200" },
  LOW:    { label: "Nice to Have",  cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{value} of {max} fulfilled</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GoalProgressBar({ raisedCents, goalCents }: { raisedCents: number; goalCents: number }) {
  const pct = goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;
  const raised = (raisedCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const goal = (goalCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>${raised} of ${goal} raised</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-8 bg-gray-100 rounded-lg mt-2" />
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function WishlistGrid({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const priority = PRIORITY_LABEL[item.priority];
        const isFulfilled = item.status === "FULFILLED" || item.status === "OPENED";
        const isGoal = item.itemType === "GOAL";
        const showQuantityProgress = !isGoal && item.quantity > 1;

        return (
          <div
            key={item.id}
            className={`relative rounded-2xl border bg-white overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
              isFulfilled ? "border-green-200" : "border-gray-100"
            }`}
          >
            {isFulfilled && (
              <div className="absolute inset-0 bg-white/75 z-10 flex items-center justify-center pointer-events-none">
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <IconCheck className="w-3 h-3" />
                  Fulfilled — Thank you!
                </span>
              </div>
            )}

            <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain p-3"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <IconGift className="w-14 h-14 text-gray-200" />
              )}
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {priority && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priority.cls}`}>
                    {priority.label}
                  </span>
                )}
                {isGoal && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <IconGift className="inline-block size-3 mr-0.5" /> Funding Goal
                  </span>
                )}
                {item.category && (
                  <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                    {item.category.name}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</h3>

              {item.description && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
              )}

              {!isGoal && item.price && <p className="text-sm font-semibold text-gray-800">{item.price}</p>}

              {isGoal && item.goalAmountCents != null ? (
                <GoalProgressBar raisedCents={item.raisedAmountCents} goalCents={item.goalAmountCents} />
              ) : (
                showQuantityProgress && <ProgressBar value={item.quantityFulfilled} max={item.quantity} />
              )}

              <div className="mt-auto pt-1 flex flex-col gap-1">
                {isFulfilled ? (
                  <button disabled className="w-full text-center text-xs font-medium py-2 px-4 rounded-lg bg-gray-100 text-gray-400 cursor-default">
                    Fulfilled ✓
                  </button>
                ) : isGoal ? (
                  <WishlistDonateButton
                    itemId={item.id}
                    itemTitle={item.title}
                    suggestedAmount={null}
                  />
                ) : (
                  <>
                    <a
                      href={item.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs font-medium py-2 px-4 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
                    >
                      View &amp; purchase →
                    </a>
                    <div className="flex items-center gap-2 my-0.5">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-300">or</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <WishlistDonateButton
                      itemId={item.id}
                      itemTitle={item.title}
                      suggestedAmount={item.price}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
