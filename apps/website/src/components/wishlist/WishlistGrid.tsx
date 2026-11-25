import Image from "next/image";

import type { PublicWishlist } from "@/server/db/wishlist";

import { classes } from "@/utils/classes";
import {
  formatPrice,
  getPartialTargetCents,
  isFullPriceDonatable,
  parsePriceCents,
} from "@/utils/wishlist";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Link from "@/components/content/Link";
import Progress from "@/components/content/Progress";
import WishlistDonateButton from "@/components/wishlist/WishlistDonateButton";

import IconCheckCircle from "@/icons/IconCheckCircle";
import IconGift from "@/icons/IconGift";

// Public items only: the public query never includes admin-only fields like notes
export type PublicWishlistItem = PublicWishlist["items"][number];

interface Props {
  items: PublicWishlistItem[];
}

const PRIORITY_LABEL: Record<string, { label: string; cls: string }> = {
  URGENT: { label: "Urgent", cls: "bg-red-600 text-white" },
  HIGH: { label: "High priority", cls: "bg-carnival text-white" },
  MEDIUM: { label: "Needed", cls: "bg-alveus-green text-alveus-tan" },
  LOW: { label: "Nice to have", cls: "bg-alveus-green-100 text-alveus-green" },
};

const badgeClasses = "rounded-full px-2 py-0.5 text-xs font-semibold";

function ProgressText({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
  );
}

const percentOf = (value: number, max: number) =>
  max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

function QuantityProgress({ value, max }: { value: number; max: number }) {
  const percent = percentOf(value, max);
  return (
    <div>
      <ProgressText label={`${value} of ${max} funded`} percent={percent} />
      <Progress progress={percent} className="h-6" />
    </div>
  );
}

function GoalProgress({
  raisedCents,
  goalCents,
}: {
  raisedCents: number;
  goalCents: number;
}) {
  const percent = percentOf(raisedCents, goalCents);
  return (
    <div>
      <ProgressText
        label={`${formatPrice(raisedCents)} of ${formatPrice(goalCents)} raised`}
        percent={percent}
      />
      <Progress progress={percent} className="h-6" />
    </div>
  );
}

const gridClasses =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function WishlistGrid({ items }: Props) {
  return (
    <ul className={gridClasses}>
      {items.map((item) => {
        const priority = PRIORITY_LABEL[item.priority];
        const isFulfilled =
          item.status === "FULFILLED" || item.status === "OPENED";
        const isGoal = item.itemType === "GOAL";
        const showQuantityProgress = !isGoal && item.quantity > 1;
        const partialTargetCents = item.allowPartialDonations
          ? getPartialTargetCents(item)
          : null;
        const goalCents = isGoal ? item.goalAmountCents : partialTargetCents;
        const priceCents = isGoal ? null : parsePriceCents(item.price);
        const isUnavailable =
          !isGoal &&
          (item.allowPartialDonations
            ? partialTargetCents == null
            : !isFullPriceDonatable(item));

        return (
          <li key={item.id}>
            <Box className="flex h-full flex-col p-0">
              <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden bg-white">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-contain p-3"
                  />
                ) : (
                  <IconGift className="size-14 text-alveus-green-200" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {priority && !isFulfilled && (
                    <span className={classes(badgeClasses, priority.cls)}>
                      {priority.label}
                    </span>
                  )}
                  {isGoal && (
                    <span
                      className={classes(
                        badgeClasses,
                        "bg-alveus-tan-200 text-alveus-green-900",
                      )}
                    >
                      Funding goal
                    </span>
                  )}
                  {item.category && (
                    <span
                      className={classes(
                        badgeClasses,
                        "border border-alveus-green/30 font-normal",
                      )}
                    >
                      {item.category.name}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl/snug font-bold text-balance">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="line-clamp-3 text-sm">{item.description}</p>
                )}

                {priceCents != null && (
                  <p className="font-semibold">{formatPrice(priceCents)}</p>
                )}

                {goalCents != null ? (
                  <GoalProgress
                    raisedCents={item.raisedAmountCents}
                    goalCents={goalCents}
                  />
                ) : (
                  showQuantityProgress && (
                    <QuantityProgress
                      value={item.quantityFulfilled}
                      max={item.quantity}
                    />
                  )
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  {isFulfilled ? (
                    <p className="flex items-center justify-center gap-1 font-semibold">
                      <IconCheckCircle className="size-5" />
                      Fully funded, thank you!
                    </p>
                  ) : isUnavailable ? (
                    <Button
                      as="button"
                      type="button"
                      filled
                      disabled
                      className="w-full text-base"
                    >
                      Unavailable
                    </Button>
                  ) : (
                    <WishlistDonateButton
                      itemId={item.id}
                      itemTitle={item.title}
                      priceCents={priceCents}
                      remainingCents={
                        partialTargetCents != null
                          ? Math.max(
                              0,
                              partialTargetCents - item.raisedAmountCents,
                            )
                          : null
                      }
                    />
                  )}

                  {!isGoal && item.url && (
                    <p className="text-center text-sm">
                      <Link href={item.url} external>
                        View product
                      </Link>{" "}
                      <span className="opacity-75">(for reference only)</span>
                    </p>
                  )}
                </div>
              </div>
            </Box>
          </li>
        );
      })}
    </ul>
  );
}
