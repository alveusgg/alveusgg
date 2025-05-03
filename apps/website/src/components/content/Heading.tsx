import { type JSX, type ReactNode, useMemo } from "react";

import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";

export type HeadingProps = {
  children?: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6 | -1;
  className?: string;
  id?: string;
  link?: boolean;
  linkClassName?: string;
};

const Heading = ({
  children,
  level = 1,
  className,
  id,
  link = false,
  linkClassName,
}: HeadingProps) => {
  const Tag = level === -1 ? "p" : (`h${level}` as keyof JSX.IntrinsicElements);
  const headingClass = useMemo(
    () =>
      classes(
        !/(^|\s)my-\d+(\s|$)/.test(className || "") && "my-2",
        !/(^|\s)text-(xs|sm|base|lg|[2-6]?xl)(\s|$)/.test(className || "") &&
          "text-3xl",
        !/(^|\s)font-(sans|serif|mono)(\s|$)/.test(className || "") &&
          "font-serif",
        !/(^|\s)font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(\s|$)/.test(
          className || "",
        ) && "font-bold",
        "text-balance",
        className,
      ),
    [className],
  );

  return (
    <Tag className={headingClass} id={id}>
      {id && link ? (
        <Link href={`#${id}`} custom className={linkClassName}>
          {children}
        </Link>
      ) : (
        children
      )}
    </Tag>
  );
};

export default Heading;
