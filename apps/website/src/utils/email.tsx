import { type DOMNode, domToReact, Element } from "html-react-parser";

import {
  type ParseOptions,
  renderSafeHtml,
} from "@/components/shared/SafeHtml";
import { Link } from "@/components/email/Link";

export const parseOptions: ParseOptions = {
  replace(node: DOMNode) {
    if (node instanceof Element && node.name === "a" && node.attribs.href) {
      return (
        <Link href={node.attribs.href}>
          {domToReact(node.children as DOMNode[], parseOptions)}
        </Link>
      );
    }
  },
};

export function renderHtmlForEmail(content: string) {
  return renderSafeHtml(content, parseOptions);
}
