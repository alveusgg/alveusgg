import React, { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";

import Heading from "@/components/content/Heading";

type MarkdownProps = {
  content: string;
};

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const components: Components = useMemo(
    () => ({
      h1: ({ children }) => (
        <Heading level={1} className="text-5xl">
          {children}
        </Heading>
      ),
      h2: ({ children }) => (
        <Heading level={2} className="mt-8">
          {children}
        </Heading>
      ),
      h3: ({ children }) => (
        <Heading level={3} className="mt-4 text-2xl">
          {children}
        </Heading>
      ),
      h4: ({ children }) => (
        <Heading level={4} className="text-xl">
          {children}
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

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};

export default Markdown;
