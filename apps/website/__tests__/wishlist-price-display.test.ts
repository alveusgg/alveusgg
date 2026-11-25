import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import WishlistAdminTable from "@/components/wishlist/WishlistAdminTable";
import WishlistGrid, {
  type PublicWishlistItem,
} from "@/components/wishlist/WishlistGrid";

vi.mock("@/utils/trpc", () => {
  const procedure = {
    useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
    useQuery: () => ({ data: undefined, isFetching: false }),
  };
  const namespace = new Proxy({}, { get: () => procedure });
  return { trpc: new Proxy({}, { get: () => namespace }) };
});

const baseItem = {
  id: "item-1",
  title: "Heat lamp",
  description: null,
  imageUrl: null,
  url: null,
  itemType: "PRODUCT",
  priority: "MEDIUM",
  status: "NEEDED",
  category: null,
  categoryId: null,
  price: "24.99" as string | null,
  quantity: 1,
  quantityFulfilled: 0,
  goalAmountCents: null as number | null,
  raisedAmountCents: 0,
  allowPartialDonations: false,
};

const renderCard = (item: Partial<typeof baseItem>) =>
  renderToStaticMarkup(
    createElement(WishlistGrid, {
      items: [{ ...baseItem, ...item } as unknown as PublicWishlistItem],
    }),
  );

const renderTable = (item: Partial<typeof baseItem>) =>
  renderToStaticMarkup(
    createElement(WishlistAdminTable, {
      items: [{ ...baseItem, ...item }] as unknown as Parameters<
        typeof WishlistAdminTable
      >[0]["items"],
      isLoading: false,
      onEdit: () => {},
      onRefresh: () => {},
    }),
  );

describe("card price", () => {
  test.each([
    ["24.99", "$24.99"],
    ["1547.00", "$1,547"],
    ["$1,234.56", "$1,234.56"],
  ])("shows %j as %s", (price, text) => {
    const html = renderCard({ price });
    expect(html).toContain(`>${text}</p>`);
    expect(html).toContain("Donate with PayPal");
  });

  test("shows raised amounts with cents", () => {
    const html = renderCard({
      price: "29.99",
      allowPartialDonations: true,
      raisedAmountCents: 1_050,
    });
    expect(html).toContain("$10.50 of $29.99 raised");
  });

  test("marks a product with an unreadable price unavailable", () => {
    const html = renderCard({ price: "about $40" });
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Unavailable<\/button>/);
    expect(html).not.toContain("about $40");
    expect(html).not.toContain("Donate with PayPal");
  });

  test("marks a partial product with no target unavailable", () => {
    const html = renderCard({ price: null, allowPartialDonations: true });
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Unavailable<\/button>/);
    expect(html).not.toContain("Chip in");
  });

  test("keeps a partial product with an explicit target donatable", () => {
    const html = renderCard({
      price: "about $40",
      allowPartialDonations: true,
      goalAmountCents: 4_000,
    });
    expect(html).toContain("Chip in");
    expect(html).not.toContain("Unavailable");
  });

  test.each(["20000.00", "0.50"])(
    "marks a full-price product priced %j unavailable",
    (price) => {
      const html = renderCard({ price });
      expect(html).toMatch(
        /<button[^>]*disabled=""[^>]*>Unavailable<\/button>/,
      );
      expect(html).not.toContain("Donate with PayPal");
    },
  );

  test("keeps an expensive partial product donatable", () => {
    const html = renderCard({ price: "20000.00", allowPartialDonations: true });
    expect(html).toContain("Chip in");
    expect(html).not.toContain("Unavailable");
  });

  test("keeps goals donatable without a price", () => {
    const html = renderCard({
      itemType: "GOAL",
      price: null,
      goalAmountCents: 50_000,
      raisedAmountCents: 12_345,
    });
    expect(html).toContain("$123.45 of $500 raised");
    expect(html).toContain("Donate with PayPal");
  });
});

describe("admin table price", () => {
  test("formats the price", () => {
    expect(renderTable({ price: "1547.00" })).toContain(">$1,547</div>");
  });

  test("does not round raised amounts", () => {
    const html = renderTable({
      price: "29.99",
      allowPartialDonations: true,
      raisedAmountCents: 1_050,
    });
    expect(html).toContain("$10.50 / $29.99 raised");
  });

  test("flags an unreadable price", () => {
    expect(renderTable({ price: "about $40" })).toContain(
      "about $40 (unreadable price)",
    );
  });

  test("flags a full-price product outside the checkout limits", () => {
    expect(renderTable({ price: "20000.00" })).toContain(
      "$20,000 (outside checkout limits)",
    );
    expect(
      renderTable({ price: "20000.00", allowPartialDonations: true }),
    ).not.toContain("outside checkout limits");
  });

  test("flags a partial product with no target", () => {
    const html = renderTable({ price: null, allowPartialDonations: true });
    expect(html).toContain("Partial donations on (no target)");
  });

  test("does not flag a partial product with a target", () => {
    const html = renderTable({ price: "29.99", allowPartialDonations: true });
    expect(html).toContain("Partial donations on</div>");
  });
});
