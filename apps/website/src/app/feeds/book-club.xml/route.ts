import { env } from "@/env";

import books from "@/data/books";

import { getRssFeedContent } from "@/utils/rss-feed";

export async function GET() {
  const bookClubPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/book-club`;
  const latestBookDate = books[0] && new Date(books[0].month);

  const bookFeedItems = books.map((book) => ({
    title: book.title,
    id: book.link, // Supposed to be a unique id/link, so can't really be the book club page
    link: bookClubPageUrl, // Books don't have individual links on the Alveus site
    description: book.link,
    date: new Date(book.month),
  }));

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
