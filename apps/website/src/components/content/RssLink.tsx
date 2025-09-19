const RssLink = ({ title, path }: { title: string; path: string }) => (
  <link rel="alternate" type="application/rss+xml" title={title} href={path} />
);

export default RssLink;
