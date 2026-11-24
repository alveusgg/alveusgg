import { describe, expect, test } from "vitest";

import {
  formatPrice,
  formatPriceExact,
  getPartialTargetCents,
  isFullPriceDonatable,
  normalizePrice,
  parsePriceCents,
} from "@/utils/wishlist";

describe("parsePriceCents", () => {
  test.each([
    ["24.99", 2499],
    ["$24.99", 2499],
    ["1,547", 154_700],
    ["1,547.50", 154_750],
    ["1547", 154_700],
    ["$1,234,567.89", 123_456_789],
    ["  $24.99  ", 2499],
    ["24.9", 2490],
    ["0.50", 50],
    ["1547.00", 154_700],
  ])("reads %j as %i cents", (input, cents) => {
    expect(parsePriceCents(input)).toBe(cents);
  });

  test.each([
    [""],
    ["   "],
    ["$"],
    ["20-30"],
    ["$20 - $30"],
    ["about 20"],
    ["twenty dollars"],
    ["-24.99"],
    ["$-24.99"],
    ["0"],
    ["0.00"],
    ["$0"],
    ["24.999"],
    ["1.547,50"],
    ["1547,50"],
    ["1 547"],
    ["15,47"],
    ["1,5470"],
    ["24."],
    [".99"],
    ["24.99 USD"],
    ["€24.99"],
  ])("rejects %j", (input) => {
    expect(parsePriceCents(input)).toBeNull();
  });

  test("rejects a missing price", () => {
    expect(parsePriceCents(null)).toBeNull();
    expect(parsePriceCents(undefined)).toBeNull();
  });

  test("keeps the partial target working", () => {
    expect(
      getPartialTargetCents({
        goalAmountCents: null,
        price: "1,547.50",
        quantity: 2,
      }),
    ).toBe(309_500);
  });
});

describe("price formatting", () => {
  test.each([
    [154_700, "$1,547"],
    [2499, "$24.99"],
    [123_456, "$1,234.56"],
    [2490, "$24.90"],
    [5, "$0.05"],
    [0, "$0"],
  ])("formatPrice(%i) is %s", (cents, text) => {
    expect(formatPrice(cents)).toBe(text);
  });

  test.each([
    [154_700, "$1,547.00"],
    [2499, "$24.99"],
    [123_456, "$1,234.56"],
  ])("formatPriceExact(%i) is %s", (cents, text) => {
    expect(formatPriceExact(cents)).toBe(text);
  });

  test("raised amounts with cents are not rounded", () => {
    expect(formatPrice(1_050)).toBe("$10.50");
    expect(formatPrice(99_999)).toBe("$999.99");
  });

  test("normalizes to two decimals without separators", () => {
    expect(normalizePrice(154_700)).toBe("1547.00");
    expect(normalizePrice(2499)).toBe("24.99");
  });
});

describe("isFullPriceDonatable", () => {
  const product = {
    itemType: "PRODUCT",
    allowPartialDonations: false,
    price: "24.99" as string | null,
  };

  test.each([
    ["1.00", true],
    ["10,000.00", true],
    ["0.99", false],
    ["10000.01", false],
    ["about $40", false],
    [null, false],
  ])("checks a full-price product priced %j", (price, expected) => {
    expect(isFullPriceDonatable({ ...product, price })).toBe(expected);
  });

  test("does not bind partial products or goals", () => {
    expect(
      isFullPriceDonatable({
        ...product,
        price: "20000",
        allowPartialDonations: true,
      }),
    ).toBe(true);
    expect(
      isFullPriceDonatable({ ...product, itemType: "GOAL", price: null }),
    ).toBe(true);
  });
});
