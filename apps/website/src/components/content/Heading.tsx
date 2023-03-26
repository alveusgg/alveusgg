import React, { useMemo } from "react";

type HeadingProps = {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  id?: string;
};

const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className,
  id,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClass = useMemo(
    () =>
      [
        !/\bmy-\d+\b/.test(className || "") && "my-2",
        !/\btext-(xs|sm|base|lg|[2-6]?xl)\b/.test(className || "") &&
          "text-3xl",
        "font-serif font-bold",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  return (
    <Tag className={headingClass} id={id}>
      {children}
    </Tag>
  );
};

export default Heading;
