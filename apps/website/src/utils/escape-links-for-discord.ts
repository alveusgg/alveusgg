import LinkifyIt from "linkify-it";

export function escapeLinksForDiscord(text: string) {
  const linkify = new LinkifyIt();

  const matches = linkify.match(text);

  let offset = 0;
  if (matches != null) {
    for (const match of matches) {
      const linkStart = match.index + offset;
      const linkEnd = match.lastIndex + offset;

      const linkified = `<${match.text}>`;
      text = text.slice(0, linkStart) + linkified + text.slice(linkEnd + 1);

      offset += linkified.length - (match.lastIndex - match.index + 1);
    }
  }

  return text;
}
