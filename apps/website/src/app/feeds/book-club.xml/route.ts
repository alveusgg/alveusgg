import { Feed } from "feed";

import type { PartialDateString } from "@alveusgg/data/build/types";

import { env } from "@/env";

// import { typeSafeObjectEntries } from "@/utils/helpers";
// import { camelToKebab } from "@/utils/string-case";

// TODO move BookInfo & books to shared location

type BookInfo = {
  title: string;
  author: string;
  // image: StaticImageData;
  month: PartialDateString & `${number}-${number}`;
  link: string;
  // thickness: (typeof thickness)[keyof typeof thickness];
  // color: `border-${string}`;
  vodId?: string;
};

const books: BookInfo[] = [
  {
    title: "The Anthropocene Reviewed",
    author: "John Green",
    // image: theAnthropoceneReviewed,
    month: "2025-05",
    link: "https://amzn.to/42LpJSo",
    // thickness: thickness.sm, // 300 pages
    // color: "border-black",
  },
  {
    title: "The Last Rhinos",
    author: "Lawrence Anthony",
    // image: theLastRhinos,
    month: "2025-04",
    link: "https://amzn.to/3YibG59",
    // thickness: thickness.md, // 360 pages
    // color: "border-alveus-tan-900",
  },
  {
    title: "Adventures of a Young Naturalist",
    author: "Sir David Attenborough",
    // image: adventuresOfAYoungNaturalist,
    month: "2025-03",
    link: "https://amzn.to/41qA2um",
    // thickness: thickness.lg, // 400 pages
    // color: "border-blue-900",
    vodId: "fRjxSfOhk94",
  },
  {
    title: "A Most Remarkable Creature",
    author: "Jonathan Meiburg",
    // image: aMostRemarkableCreature,
    month: "2025-02",
    link: "https://amzn.to/410hD8x",
    // thickness: thickness.lg, // 400 pages
    // color: "border-alveus-tan-200/75",
    vodId: "AH0mwSckVns",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    // image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    // thickness: thickness.sm, // 320 pages
    // color: "border-black",
    vodId: "EfCksCFlq84",
  },
];

export async function GET() {
  const bookClubPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/book-club`;

  const latestBookDate = (books[0] && new Date(books[0].month)) || undefined;

  const feed = new Feed({
    title: "Alveus Sanctuary Book Club",
    description: "A feed for new books read by the book club",
    id: bookClubPageUrl,
    link: bookClubPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestBookDate,
  });

  books.forEach((book) => {
    feed.addItem({
      title: book.title,
      id: book.link, // Supposed to be a unique id/link, so can't really be the book club page
      link: bookClubPageUrl, // Books don't have individual links on the Alveus site
      description: book.link,
      content: book.link,
      date: new Date(book.month),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
