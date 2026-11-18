import { describe, expect, it } from "vitest";

import {
  getWishlistCampaignId,
  parseWishlistCampaignCategories,
} from "../wishlist-campaigns";

describe("parseWishlistCampaignCategories", () => {
  it("maps each slug to its campaign ID", () => {
    expect(parseWishlistCampaignCategories("25:arri-wishlist,99:test")).toEqual(
      new Map([
        ["arri-wishlist", "25"],
        ["test", "99"],
      ]),
    );
  });

  it("trims whitespace around entries and parts", () => {
    expect(
      parseWishlistCampaignCategories(" 25 : arri-wishlist , 99:test "),
    ).toEqual(
      new Map([
        ["arri-wishlist", "25"],
        ["test", "99"],
      ]),
    );
  });

  it.each([undefined, null, "", "  ", ",", " , ,"])(
    "returns an empty map for %j",
    (value) => {
      expect(parseWishlistCampaignCategories(value).size).toBe(0);
    },
  );

  it("ignores empty entries between valid ones", () => {
    expect(
      parseWishlistCampaignCategories("25:arri-wishlist,,99:test,"),
    ).toEqual(
      new Map([
        ["arri-wishlist", "25"],
        ["test", "99"],
      ]),
    );
  });

  it.each(["abc:test", "2a:test", "-1:test", ":test", "2.5:test"])(
    "rejects the campaign ID in %j",
    (value) => {
      expect(() => parseWishlistCampaignCategories(value)).toThrow(
        "campaign ID must be digits only",
      );
    },
  );

  it.each(["25:", "25:Arri", "25:arri_wishlist", "25:a b", "25:a:b"])(
    "rejects the slug in %j",
    (value) => {
      expect(() => parseWishlistCampaignCategories(value)).toThrow(
        "slug must be 1 to 100 lowercase letters, digits or hyphens",
      );
    },
  );

  it("rejects a slug longer than 100 characters", () => {
    expect(() =>
      parseWishlistCampaignCategories(`25:${"a".repeat(101)}`),
    ).toThrow("slug must be");
  });

  it("rejects an entry without a separator", () => {
    expect(() => parseWishlistCampaignCategories("25")).toThrow(
      'expected "campaignId:slug"',
    );
  });

  it("rejects a duplicate slug", () => {
    expect(() =>
      parseWishlistCampaignCategories("25:arri-wishlist,99:arri-wishlist"),
    ).toThrow('slug "arri-wishlist" is mapped more than once');
  });

  it("allows several slugs in the same campaign", () => {
    expect(parseWishlistCampaignCategories("25:arri-wishlist,25:test")).toEqual(
      new Map([
        ["arri-wishlist", "25"],
        ["test", "25"],
      ]),
    );
  });
});

describe("getWishlistCampaignId", () => {
  const campaigns = parseWishlistCampaignCategories("25:arri-wishlist,99:test");

  it("returns the mapped campaign", () => {
    expect(getWishlistCampaignId("arri-wishlist", campaigns)).toBe("25");
    expect(getWishlistCampaignId("test", campaigns)).toBe("99");
  });

  it.each(["other", "", null, undefined])(
    "returns the default campaign for %j",
    (slug) => {
      expect(getWishlistCampaignId(slug, campaigns)).toBe("24");
    },
  );

  it("returns the default campaign with no mapping", () => {
    expect(getWishlistCampaignId("arri-wishlist", new Map())).toBe("24");
  });
});
