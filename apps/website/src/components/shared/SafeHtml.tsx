import { type ReactNode, Fragment, useMemo, isValidElement } from "react";
import parse, {
  domToReact,
  Element,
  Text,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";

import Link from "@/components/content/Link";

export type ParseOptions = HTMLReactParserOptions;

type SafeHtmlRenderProps = { content: ReactNode };
type SafeHtmlRenderFunction = (props: SafeHtmlRenderProps) => ReactNode;
type SafeHtmlProps = {
  children?: SafeHtmlRenderFunction;
  html: string;
  parseOptions?: ParseOptions;
};

export const ROOT_NODE_NAME = "root";

export const Empty = () => <Fragment />;

export function isEmpty(content: ReactNode) {
  return !isValidElement(content) || content.type === Empty;
}

export function getTextContentRecursive(node: DOMNode): string {
  if (node instanceof Element) {
    return (node.children as DOMNode[])
      .map((child) => getTextContentRecursive(child))
      .join("");
  }

  if (node instanceof Text) {
    return node.data || "";
  }

  return "";
}

export const createRootReplacer = (
  getParseOptions: () => HTMLReactParserOptions,
) =>
  function rootReplacer(node: DOMNode) {
    if (node instanceof Element && node.name === ROOT_NODE_NAME) {
      return getTextContentRecursive(node).trim() ? (
        <Fragment>
          {domToReact(node.children as DOMNode[], getParseOptions())}
        </Fragment>
      ) : (
        <Empty />
      );
    }

    return undefined;
  };

export const createNextLinkReplacer = (
  getParseOptions: () => HTMLReactParserOptions,
) =>
  function replaceLinksWithNextLinks(node: DOMNode) {
    if (node instanceof Element && node.name === "a" && node.attribs.href) {
      return (
        <Link href={node.attribs.href} external>
          {domToReact(node.children as DOMNode[], getParseOptions())}
        </Link>
      );
    }
  };

export const defaultParseOptions: ParseOptions = {
  replace: createRootReplacer(() => defaultParseOptions),
};

export function renderSafeHtml(
  html: string,
  parseOptions: ParseOptions = defaultParseOptions,
) {
  return parse(`<${ROOT_NODE_NAME}>${html}</${ROOT_NODE_NAME}>`, parseOptions);
}

export function SafeHtml({ children, html, parseOptions }: SafeHtmlProps) {
  const safeHtml = useMemo(
    () => renderSafeHtml(html, parseOptions),
    [html, parseOptions],
  );

  if (typeof children === "function") {
    return children({ content: safeHtml });
  }

  return safeHtml;
}
