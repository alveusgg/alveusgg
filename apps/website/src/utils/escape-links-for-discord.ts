// eslint-disable-next-line import/no-named-as-default
import LinkifyIt from "linkify-it";

export function escapeLinksForDiscord(text: string) {
  const linkify = new LinkifyIt({
    fuzzyLink: false,
    fuzzyEmail: false,
    fuzzyIP: false,
  });

  const matches = linkify.match(text);

  let offset = 0;
  if (matches != null) {
    for (const match of matches) {
      const linkStart = match.index + offset;
      const linkEnd = match.lastIndex + offset;

      const linkified = `<${match.text}>`;
      text = text.slice(0, linkStart) + linkified + text.slice(linkEnd);

      offset += linkified.length - (match.lastIndex - match.index);
    }
  }

  return text;
}
