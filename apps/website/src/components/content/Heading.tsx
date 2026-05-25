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
        "my-2 scroll-mt-16 font-serif text-3xl font-bold text-balance",
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
