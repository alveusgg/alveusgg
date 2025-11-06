import NextLink from "next/link";
import { type ComponentProps, useMemo } from "react";

import { classes } from "@/utils/classes";

import IconExternal from "@/icons/IconExternal";

type LinkProps = {
  external?: boolean;
  custom?: boolean;
  dark?: boolean;
} & ComponentProps<typeof NextLink>;

const Link = ({
  external = false,
  custom = false,
  dark = false,
  className,
  target,
  rel,
  children,
  ...props
}: LinkProps) => {
  const computedClassName = useMemo(
    () =>
      classes(
        !custom && "underline transition-colors",
        !custom &&
          (dark
            ? "text-red-200 hover:text-blue-200 dark:text-alveus-tan"
            : "text-red-600 hover:text-blue-600 dark:text-alveus-tan"),
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
          className="mr-0.5 ml-1 inline-block align-baseline"
        />
      )}
    </NextLink>
  );
};

export default Link;
