import { Feed } from "feed";

import { env } from "@/env";

import books from "@/data/books";

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
