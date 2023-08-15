import React, { useMemo } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import headingId from "remark-heading-id";

import { classes } from "@/utils/classes";

import Heading, { type HeadingProps } from "@/components/content/Heading";
import Link from "@/components/content/Link";

const MarkdownHeading: React.FC<HeadingProps> = ({
  level,
  className,
  children,
  id,
}) => (
  <Heading
    level={level}
    className={classes(className, "break-words")}
    id={id}
    link
  >
    {children}
  </Heading>
);

type MarkdownProps = {
  content: string;
  dark?: boolean;
};

const Markdown: React.FC<MarkdownProps> = ({ content, dark = false }) => {
  const components: Components = useMemo(
    () => ({
      h1: ({ children, id }) => (
        <MarkdownHeading level={1} className="text-5xl" id={id}>
          {children}
        </MarkdownHeading>
      ),
      h2: ({ children, id }) => (
        <MarkdownHeading level={2} className="mt-8" id={id}>
          {children}
        </MarkdownHeading>
      ),
      h3: ({ children, id }) => (
        <MarkdownHeading level={3} className="mt-4 text-2xl" id={id}>
          {children}
        </MarkdownHeading>
      ),
      h4: ({ children, id }) => (
        <MarkdownHeading level={4} className="text-xl" id={id}>
          {children}
        </MarkdownHeading>
      ),
      h5: ({ children, id }) => (
        <MarkdownHeading level={5} className="text-lg" id={id}>
          {children}
        </MarkdownHeading>
      ),
      h6: ({ children, id }) => (
        <MarkdownHeading level={6} className="text-base" id={id}>
          {children}
        </MarkdownHeading>
      ),
      ul: ({ children }) => <ul className="my-2 ml-8 list-disc">{children}</ul>,
      ol: ({ children }) => (
        <ol className="my-2 ml-8 list-decimal">{children}</ol>
      ),
      a: ({ children, href }) => (
        <Link
          href={href || ""}
          external={!!href && /^(https?:)?\/\//.test(href)}
          dark={dark}
        >
          {children}
        </Link>
      ),
      p: ({ children }) => <p className="my-2">{children}</p>,
    }),
    [dark],
  );

  const plugins: Options["remarkPlugins"] = useMemo(() => [headingId], []);

  return (
    <ReactMarkdown components={components} remarkPlugins={plugins}>
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
