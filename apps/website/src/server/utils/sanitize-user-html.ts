import domPurify, { type Config } from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = domPurify(window);

purify.addHook("afterSanitizeAttributes", function (node) {
  if (node instanceof window.HTMLAnchorElement) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noreferrer");
  }
});

const defaultConfig = {
  ALLOWED_TAGS: ["p", "a", "b", "i", "strong", "em", "ul", "li", "ol", "#text"],
  ADD_ATTR: [],
  ADD_TAGS: [],
  KEEP_CONTENT: true,
} satisfies Config;

export function sanitizeUserHtml(html: string, config: Config = defaultConfig) {
  return String(
    purify.sanitize(html, {
      ...config,
      RETURN_DOM: false,
    }),
  );
}
