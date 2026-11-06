import type { NextPage } from "next";
import { useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

import IconWarningTriangle from "@/icons/IconWarningTriangle";

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const filterClasses = (active: boolean) =>
  classes(
    "rounded-full border-2 border-alveus-green px-4 py-1.5 text-sm font-semibold transition-colors",
    active
      ? "bg-alveus-green text-alveus-tan"
      : "text-alveus-green hover:bg-alveus-green hover:text-alveus-tan",
  );

const WishlistPage: NextPage = () => {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null,
  );

  const itemsQuery = trpc.wishlist.getPublicItems.useQuery({
    categorySlug: activeCategorySlug ?? undefined,
  });

  const categoriesQuery = trpc.wishlist.getCategories.useQuery();

  const items = (itemsQuery.data ?? []).filter((i) => i.status !== "ARCHIVED");

  const sorted = [...items].sort((a, b) => {
    const pDiff =
      (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    if (pDiff !== 0) return pDiff;
    return a.sortOrder - b.sortOrder;
  });

  const isDone = (status: string) =>
    status === "FULFILLED" || status === "OPENED";
  const urgent = sorted.filter(
    (i) => i.priority === "URGENT" && !isDone(i.status),
  );
  const needed = sorted.filter(
    (i) => i.priority !== "URGENT" && !isDone(i.status),
  );
  const fulfilled = sorted.filter((i) => isDone(i.status));

  return (
    <>
      <Meta
        title="Wishlist"
        description="Help support Alveus Sanctuary's animal ambassadors by donating toward items on our wishlist. Alveus buys each item once it is funded."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-12">
        <div className="flex flex-col gap-4 lg:max-w-4xl">
          <Heading className="my-0">Sanctuary Wishlist</Heading>
          <p className="text-lg">
            Help us care for our animal ambassadors! Every item on this list
            supports the daily needs, enrichment, and welfare of the animals at
            Alveus.
          </p>
          <p>
            Donate toward any item through PayPal. Once an item is funded,
            Alveus buys it and has it shipped to the sanctuary. Product links
            are for reference only. Have a question?{" "}
            <Link href="/contact-us" dark>
              Contact us
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <div
            className="mb-8 flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Filter by category"
          >
            <button
              type="button"
              aria-pressed={activeCategorySlug === null}
              onClick={() => setActiveCategorySlug(null)}
              className={filterClasses(activeCategorySlug === null)}
            >
              All items
            </button>
            {categoriesQuery.data.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activeCategorySlug === cat.slug}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={filterClasses(activeCategorySlug === cat.slug)}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-75">
                  {cat._count.items}
                </span>
              </button>
            ))}
          </div>
        )}

        {itemsQuery.isPending ? (
          <WishlistGrid items={[]} loading />
        ) : (
          <>
            {urgent.length > 0 && (
              <div className="mb-10">
                <Heading
                  level={2}
                  className="mb-4 flex items-center gap-2 text-2xl"
                >
                  <IconWarningTriangle className="size-6 text-red-600" />
                  Urgent needs
                </Heading>
                <WishlistGrid items={urgent} />
              </div>
            )}

            {needed.length > 0 && (
              <div className="mb-10">
                {urgent.length > 0 && (
                  <Heading level={2} className="mb-4 text-2xl">
                    More items needed
                  </Heading>
                )}
                <WishlistGrid items={needed} />
              </div>
            )}

            {fulfilled.length > 0 && (
              <details className="mt-8">
                <summary className="cursor-pointer font-semibold select-none">
                  Show funded items ({fulfilled.length})
                </summary>
                <div className="mt-4 opacity-75">
                  <WishlistGrid items={fulfilled} />
                </div>
              </details>
            )}

            {items.length === 0 && (
              <p className="py-16 text-center">
                No items in this category right now. Check back soon!
              </p>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default WishlistPage;
