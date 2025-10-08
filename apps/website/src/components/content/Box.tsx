import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

type BoxProps = {
  children?: ReactNode;
  dark?: boolean;
  className?: string;
  ringClassName?: string;
};

const Box = ({ dark, className, ringClassName, children }: BoxProps) => (
  <div
    className={classes(
      "relative isolate overflow-hidden rounded-xl shadow-xl",
      // add padding if not overwritten via className
      !/\bp-\d+\b/.test(className || "") && "p-8",
      // add background color if not overwritten via className
      !/\bbg-/.test(className || "") &&
        (dark ? "bg-alveus-green" : "bg-alveus-tan"),
      // add text color if not overwritten via className
      !/\btext-/.test(className || "") &&
        (dark ? "text-alveus-tan" : "text-alveus-green-900"),
      className,
    )}
  >
    {children}
    <div
      className={classes(
        "pointer-events-none absolute inset-0 z-10 rounded-xl ring-4 ring-inset",
        // add ring color if not overwritten via ringClassName
        !/\bring-\D+/.test(ringClassName || "") &&
          (dark ? "ring-white/15" : "ring-black/15"),
        ringClassName,
      )}
    />
  </div>
);

export default Box;
