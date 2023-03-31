import React, { useMemo } from "react";

type HeadingProps = {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClass = useMemo(
    () =>
      [
        !/\bmy-\d+\b/.test(className || "") && "my-2",
        "font-serif text-3xl font-bold",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  return <Tag className={headingClass}>{children}</Tag>;
};

export default Heading;
