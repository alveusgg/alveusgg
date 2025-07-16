import { Feed } from "feed";

export type RssFeedParameters = {
  title: string;
  description: string;
  id: string;
  link: string;
  updated: Date | undefined;
  items: Array<RssFeedItem>;
  // TODO favicon?
};

export type RssFeedItem = {
  title: string;
  id: string;
  link: string;
  description: string | undefined;
  date: Date;
  // TODO image?
};

export function getRssFeedContent(options: RssFeedParameters) {
  const feed = new Feed({
    title: options.title,
    description: options.description,
    id: options.id,
    link: options.link,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: options.updated,
    // TODO favicon?
  });

  options.items.forEach((item) => {
    feed.addItem({
      title: item.title,
      id: item.id,
      link: item.link,
      description: item.description,
      date: item.date,
      // TODO image?
    });
  });

  return feed.rss2();
}
