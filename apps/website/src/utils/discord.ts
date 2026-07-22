import { LinkifyIt } from "linkify-it";

type DiscordTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export const getDiscordTimestamp = (
  date: Date,
  style: DiscordTimestampStyle = "f",
): string => {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${style}>`;
};

export const escapeLinksForDiscord = (text: string) => {
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
};
