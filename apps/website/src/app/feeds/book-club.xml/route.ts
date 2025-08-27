import { env } from "@/env";

import books, { type BookInfo } from "@/data/books";

import { getRssFeedContent } from "@/utils/rss-feed";
import { convertToSlug } from "@/utils/slugs";

type NonEmptyArray<T> = [T, ...T[]];

export async function GET() {
  const bookClubPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/book-club`;
  // If a book goes for an additional month, keep using the first month as the last updated date
  const latestBook = (books as NonEmptyArray<BookInfo>)[0];
  const latestBookDate = new Date(
    (latestBook.month as NonEmptyArray<string>)[0],
  );

  const bookFeedItems = books.map((book) => {
    const month = book.month as NonEmptyArray<string>;
    return {
      title: book.title,
      id: `${bookClubPageUrl}:${convertToSlug(month[0])}`,
      link: bookClubPageUrl, // Books don't have individual links on the Alveus site
      description: book.link,
      date: new Date(month[0]),
    };
  });

  const bookFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Book Club",
    description: "A feed for new books read by the book club",
    id: bookClubPageUrl,
    link: bookClubPageUrl,
    updated: latestBookDate,
    items: bookFeedItems,
  });

  return new Response(bookFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
