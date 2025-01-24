import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

const BadgeBackground = ({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={classes(
      "absolute inset-0 aspect-square h-full w-full drop-shadow",
      dark ? "fill-alveus-tan" : "fill-alveus-green",
      className,
    )}
    viewBox="0 0 24 24"
  >
    <path d="m12 0 2.1 2.6 3.1-1.4.8 3.3h3.4l-.7 3.3 3 1.5-2 2.7 2 2.7-3 1.5.7 3.3H18l-.8 3.3-3-1.4L12 24l-2.1-2.6-3.1 1.4-.8-3.3H2.6l.7-3.3-3-1.5 2-2.7-2-2.7 3-1.5-.7-3.3H6l.8-3.3 3 1.4z" />
  </svg>
);

export const Badge = ({
  children,
  dark = false,
  pulse = false,
}: {
  children: ReactNode;
  dark?: boolean;
  pulse?: boolean;
}) => {
  return (
    <div className="flex aspect-square w-[80px] items-center justify-center rotate-12">
      {pulse && (
        <div className="absolute inset-0 size-full opacity-25 scale-75 motion-reduce:hidden">
          <BadgeBackground dark={dark} className="animate-ping scale-150" />
        </div>
      )}
      <BadgeBackground dark={dark} />
      <span
        className={classes(
          "relative w-3/4 text-center text-sm leading-tight",
          dark ? "text-alveus-green-900" : "text-alveus-tan",
        )}
      >
        {children}
      </span>
    </div>
  );
};
