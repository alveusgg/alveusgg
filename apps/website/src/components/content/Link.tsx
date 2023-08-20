import React, { useMemo } from "react";
import NextLink from "next/link";

import { classes } from "@/utils/classes";

import IconExternal from "@/icons/IconExternal";

type LinkProps = {
  external?: boolean;
  custom?: boolean;
  dark?: boolean;
} & React.ComponentProps<typeof NextLink>;

const Link: React.FC<LinkProps> = ({
  external = false,
  custom = false,
  dark = false,
  className,
  target,
  rel,
  children,
  ...props
}) => {
  const computedClassName = useMemo(
    () =>
      classes(
        !custom && "transition-colors hover:underline",
        !custom &&
          (dark
            ? "text-red-200 hover:text-blue-200"
            : "text-red-600 hover:text-blue-600"),
        className,
      ),
    [custom, dark, className],
  );

  const computedTarget = useMemo(
    () => (external ? "_blank" : target),
    [external, target],
  );
  const computedRel = useMemo(
    () => (external ? "noreferrer" : rel),
    [external, rel],
  );

  return (
    <NextLink
      {...props}
      className={computedClassName}
      target={computedTarget}
      rel={computedRel}
    >
      {children}
      {external && !custom && (
        <IconExternal
          size="0.75em"
          className="ml-1 mr-0.5 inline-block align-baseline"
        />
      )}
    </NextLink>
  );
};

export default Link;
