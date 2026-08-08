/**
 * apps/website/src/pages/wishlist/index.tsx
 *
 * Public-facing wishlist page for alveussanctuary.org.
 * Follows the site's existing page layout conventions.
 */

import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import Section from "../../components/content/Section";
import Heading from "../../components/content/Heading";
import WishlistGrid from "../../components/wishlist/WishlistGrid";

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const WishlistPage: NextPage = () => {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);

  const itemsQuery = trpc.wishlist.getPublicItems.useQuery({
    categorySlug: activeCategorySlug ?? undefined,
  });

  const categoriesQuery = trpc.wishlist.getCategories.useQuery();

  const items = (itemsQuery.data ?? []).filter((i) => i.status !== "ARCHIVED");

  // Sort: URGENT first, then by sortOrder
  const sorted = [...items].sort((a, b) => {
    const pDiff = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    if (pDiff !== 0) return pDiff;
    return a.sortOrder - b.sortOrder;
  });

  const urgent = sorted.filter((i) => i.priority === "URGENT" && i.status !== "FULFILLED");
  const needed = sorted.filter((i) => i.priority !== "URGENT" && i.status !== "FULFILLED");
  const fulfilled = sorted.filter((i) => i.status === "FULFILLED");

  return (
    <>
      <Head>
        <title>Wishlist | Alveus Sanctuary</title>
        <meta
          name="description"
          content="Help support Alveus Sanctuary's animal ambassadors by purchasing items from our wishlist. Every contribution makes a difference!"
        />
      </Head>

      <Section>
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Heading level={1}>Sanctuary Wishlist</Heading>
          <p className="mt-4 text-lg text-gray-600">
            Help us care for our animal ambassadors! Every item on this list supports
            the daily needs, enrichment, and welfare of the animals at Alveus.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            After purchasing, you can ship directly to us.{" "}
            <Link href="/about#contact" className="text-green-700 underline hover:text-green-800">
              Contact us
            </Link>{" "}
            for our shipping address.
          </p>
        </div>

        {/* Category filters */}
        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setActiveCategorySlug(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategorySlug === null
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Items
            </button>
            {categoriesQuery.data.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategorySlug === cat.slug
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
                {cat._count.items > 0 && (
                  <span className="ml-1.5 opacity-60 text-xs">{cat._count.items}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {itemsQuery.isLoading ? (
          <WishlistGrid items={[]} loading />
        ) : (
          <>
            {/* Urgent needs */}
            {urgent.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Urgent Needs
                  </span>
                  <span className="text-sm text-gray-400">{urgent.length} item{urgent.length !== 1 ? "s" : ""}</span>
                </div>
                <WishlistGrid items={urgent} />
              </div>
            )}

            {/* Regular needed items */}
            {needed.length > 0 && (
              <div className="mb-10">
                {urgent.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">More Items Needed</h2>
                )}
                <WishlistGrid items={needed} />
              </div>
            )}

            {/* Fulfilled items */}
            {fulfilled.length > 0 && (
              <details className="mt-8">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 select-none">
                  Show fulfilled items ({fulfilled.length})
                </summary>
                <div className="mt-4 opacity-60">
                  <WishlistGrid items={fulfilled} />
                </div>
              </details>
            )}

            {items.length === 0 && (
              <p className="text-center text-gray-400 py-16 text-sm">
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
