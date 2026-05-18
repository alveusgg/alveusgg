import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

type BoxProps = {
  children?: ReactNode;
  dark?: boolean;
  className?: string;
  ringClassName?: string;
  roundedClassName?: string;
};

const Box = ({
  dark,
  className,
  ringClassName,
  roundedClassName = "rounded-xl",
  children,
}: BoxProps) => (
  <div
    className={classes(
      "relative isolate overflow-hidden rounded-xl p-8 shadow-xl",
      dark
        ? "bg-alveus-green text-alveus-tan"
        : "bg-alveus-tan text-alveus-green-900",
      className,
    )}
  >
    {children}
    <div
      className={classes(
        "pointer-events-none absolute inset-0 z-10 ring-4 ring-inset",
        roundedClassName,
        dark ? "ring-white/15" : "ring-black/15",
        ringClassName,
      )}
    />
  </div>
);

export default Box;
