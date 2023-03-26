import React, { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import headingId from "remark-heading-id";

import Heading from "@/components/content/Heading";

type MarkdownProps = {
  content: string;
};

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const components: Components = useMemo(
    () => ({
      h1: ({ children, id }) => (
        <Heading level={1} className="text-5xl" id={id}>
          {id ? <Link href={`#${id}`}>{children}</Link> : children}
        </Heading>
      ),
      h2: ({ children, id }) => (
        <Heading level={2} className="mt-8" id={id}>
          {id ? <Link href={`#${id}`}>{children}</Link> : children}
        </Heading>
      ),
      h3: ({ children, id }) => (
        <Heading level={3} className="mt-4 text-2xl" id={id}>
          {id ? <Link href={`#${id}`}>{children}</Link> : children}
        </Heading>
      ),
      h4: ({ children, id }) => (
        <Heading level={4} className="text-xl" id={id}>
          {id ? <Link href={`#${id}`}>{children}</Link> : children}
        </Heading>
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
