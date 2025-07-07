export function RssLink({ title, path }: { title: string; path: string }) {
  return (
    <link
      rel="alternate"
      type="application/rss+xml"
      title={title}
      href={path}
    />
  );
}
