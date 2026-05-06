export function getLinkDisplayText(link: string) {
  return link.replace(/^(https?:)?\/\/(www\.)?/, "");
}
