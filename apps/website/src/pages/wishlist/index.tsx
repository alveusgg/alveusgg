import type { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";

import { trpc } from "@/utils/trpc";

import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import PoBoxAddress from "@/components/content/PoBoxAddress";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import WishlistCategoryFilter from "@/components/wishlist/WishlistCategoryFilter";
import WishlistFundedItems from "@/components/wishlist/WishlistFundedItems";
import WishlistFundsNote from "@/components/wishlist/WishlistFundsNote";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

import IconGift from "@/icons/IconGift";
import IconWarningTriangle from "@/icons/IconWarningTriangle";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const sectionLinks = [
  { name: "Wishlist goals", href: "#wishlist-goals" },
  { name: "PO Box", href: "#po-box" },
];

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
        title="Wishlist & PO Box"
        description="Send a gift from Alveus Sanctuary's Amazon wishlist or to our PO Box, or donate toward a wishlist goal."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12"
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <Heading className="my-0">Wishlist &amp; PO Box</Heading>
          <p className="text-lg">
            Help us care for our ambassadors by sending supplies or contributing
            to a wishlist goal.
          </p>
        </div>
        <div id="amazon-wishlist" className="max-w-xl scroll-mt-16">
          <Donate
            type="wishlist"
            description="Choose a gift and have Amazon ship it directly to Alveus."
          />
        </div>
      </Section>

      <SubNav links={sectionLinks} className="z-20" />

      <Section className="grow pt-8">
        <Heading level={2} id="wishlist-goals" className="mt-0">
          Wishlist goals
        </Heading>
        <p className="mb-8">
          Donate toward a goal through PayPal. Product links show what we plan
          to buy.
        </p>

        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <WishlistCategoryFilter
            categories={categoriesQuery.data}
            active={activeCategorySlug}
            onChange={setActiveCategorySlug}
          />
        )}

        {itemsQuery.isPending ? (
          <WishlistGrid items={[]} loading />
        ) : (
          <>
            {urgent.length > 0 && (
              <div className="mb-10">
                <Heading
                  level={3}
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
                  <Heading level={3} className="mb-4 text-2xl">
                    More items needed
                  </Heading>
                )}
                <WishlistGrid items={needed} />
              </div>
            )}

            {fulfilled.length > 0 && <WishlistFundedItems items={fulfilled} />}

            {items.length === 0 && (
              <p className="py-16 text-center">
                No items in this category right now. Check back soon!
              </p>
            )}
          </>
        )}
        <WishlistFundsNote className="mt-10 max-w-prose border-t border-alveus-green/20 pt-4" />
      </Section>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -top-40 right-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block"
        />

        <Section
          dark
          className="bg-alveus-green-900 py-12"
          containerClassName="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12 lg:pr-40"
        >
          <div className="flex max-w-prose flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-alveus-tan p-2 text-alveus-green">
                <IconGift size={28} aria-hidden="true" />
              </div>
              <Heading level={2} id="po-box" className="my-0">
                PO Box
              </Heading>
            </div>
            <p className="text-lg">
              Didn&apos;t find what you were looking for on the wishlists, or
              have something special in mind for the ambassadors? Mail it to our
              PO Box.
            </p>
            <p>
              Questions about sending a gift?{" "}
              <Link href="/contact-us" dark>
                Contact us
              </Link>
              .
            </p>
          </div>

          <PoBoxAddress />
        </Section>
      </div>
    </>
  );
};

export default WishlistPage;
