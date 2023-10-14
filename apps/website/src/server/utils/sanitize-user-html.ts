import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
// NOTE: DOMPurify types expect a Window object, but it works with a JSDOM window
const purify = DOMPurify(window as unknown as Window);

purify.addHook("afterSanitizeAttributes", function (node) {
  if ("target" in node || node.nodeName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noreferrer");
  }
});

const defaultConfig = {
  ALLOWED_TAGS: ["p", "a", "b", "i", "strong", "em", "ul", "li", "ol", "#text"],
  ADD_ATTR: [],
  ADD_TAGS: [],
  KEEP_CONTENT: true,
} satisfies DOMPurify.Config;

export function sanitizeUserHtml(
  html: string,
  config: DOMPurify.Config = defaultConfig,
) {
  return String(
    purify.sanitize(html, {
      ...config,
      RETURN_DOM: false,
    }),
  );
}
