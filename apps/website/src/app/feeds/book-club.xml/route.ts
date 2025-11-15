import { env } from "@/env";

import books from "@/data/books";

import { getRssFeedContent } from "@/utils/rss-feed";
import { convertToSlug } from "@/utils/slugs";

export async function GET() {
  const bookClubPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/book-club`;
  // If a book goes for an additional month, keep using the first month as the last updated date
  const latestBook = books[0];
  const latestBookDate = new Date(latestBook.month);

  const bookFeedItems = books.map((book) => {
    return {
      title: book.title,
      id: `${bookClubPageUrl}:${convertToSlug(book.month)}`,
      link: bookClubPageUrl, // Books don't have individual links on the Alveus site
      description: book.link,
      date: new Date(book.month),
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
