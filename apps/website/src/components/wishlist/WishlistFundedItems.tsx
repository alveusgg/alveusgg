import { classes } from "@/utils/classes";

import Button from "@/components/content/Button";
import { wishlistButtonClasses } from "@/components/wishlist/WishlistCategoryFilter";
import WishlistGrid, {
  type PublicWishlistItem,
} from "@/components/wishlist/WishlistGrid";

import IconChevronDown from "@/icons/IconChevronDown";

export default function WishlistFundedItems({
  items,
}: {
  items: PublicWishlistItem[];
}) {
  return (
    <details className="group/funded mt-8">
      <Button
        as="summary"
        className={classes(
          wishlistButtonClasses,
          "inline-flex list-none items-center gap-2 select-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <span>
          <span className="group-open/funded:hidden">Show</span>
          <span className="hidden group-open/funded:inline">Hide</span> funded
          items ({items.length})
        </span>
        <IconChevronDown
          size={16}
          aria-hidden="true"
          className="transition-transform group-open/funded:rotate-180 motion-reduce:transition-none"
        />
      </Button>
      <div className="mt-4 opacity-75">
        <WishlistGrid items={items} />
      </div>
    </details>
  );
}
