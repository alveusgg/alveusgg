import type { PublicWishlist } from "@/server/db/wishlist";

import { classes } from "@/utils/classes";

import Button from "@/components/content/Button";

type WishlistCategory = PublicWishlist["categories"][number];

export const wishlistButtonClasses =
  "cursor-pointer px-3 py-1 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700";

const categoryButtonClasses = classes(
  wishlistButtonClasses,
  "hover:not-disabled:bg-alveus-green-100 hover:not-disabled:text-alveus-green aria-pressed:hover:not-disabled:bg-alveus-green aria-pressed:hover:not-disabled:text-alveus-tan",
);

interface Props {
  categories: WishlistCategory[];
  active: string | null;
  onChange: (slug: string | null) => void;
}

export default function WishlistCategoryFilter({
  categories,
  active,
  onChange,
}: Props) {
  return (
    <div
      className="mb-8 flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      <Button
        as="button"
        type="button"
        aria-pressed={active === null}
        filled={active === null}
        onClick={() => onChange(null)}
        className={categoryButtonClasses}
      >
        All items
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          as="button"
          type="button"
          aria-pressed={active === cat.slug}
          filled={active === cat.slug}
          onClick={() => onChange(cat.slug)}
          className={categoryButtonClasses}
        >
          {cat.name}
          <span className="ml-1.5 text-xs opacity-75">{cat._count.items}</span>
        </Button>
      ))}
    </div>
  );
}
