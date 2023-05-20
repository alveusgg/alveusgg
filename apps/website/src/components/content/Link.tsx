import React from "react";
import NextLink from "next/link";

import { classes } from "@/utils/classes";

import IconExternal from "@/icons/IconExternal";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  external?: boolean;
  custom?: boolean;
  prefetch?: boolean;
};

const Link: React.FC<LinkProps> = ({
  href,
  children,
  onClick,
  className,
  external = false,
  custom = false,
  prefetch,
}) => {
  const props = {
    href,
    onClick,
    prefetch,
    className: classes(
      !custom &&
        "text-red-600 transition-colors hover:text-blue-600 hover:underline",
      className
    ),
    ...(external ? { target: "_blank", rel: "noreferrer" } : {}),
  };

  return (
    <NextLink {...props}>
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
