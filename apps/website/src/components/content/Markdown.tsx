import React, { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import headingId from "remark-heading-id";

import Heading, { type HeadingProps } from "@/components/content/Heading";

const MarkdownHeading: React.FC<HeadingProps> = ({
  level,
  className,
  children,
  id,
}) => (
  <Heading
    level={level}
    className={[className, "break-words"].filter(Boolean).join(" ")}
    id={id}
  >
    {id ? <Link href={`#${id}`}>{children}</Link> : children}
  </Heading>
);

type MarkdownProps = {
  content: string;
};

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
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
      a: ({ children, href }) => {
        const isExternal = href && /^(https?:)?\/\//.test(href);
        return (
          <Link
            href={href || ""}
            {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
            className="text-red-600 transition-colors hover:text-blue-600 hover:underline"
          >
            {children}
          </Link>
        );
      },
      p: ({ children }) => <p className="my-2">{children}</p>,
    }),
    []
  );

  const plugins: Options["remarkPlugins"] = useMemo(() => [headingId], []);

  return (
    <ReactMarkdown components={components} remarkPlugins={plugins}>
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
