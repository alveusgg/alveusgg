import { type ComponentType, type ReactNode } from "react";

import { classes } from "@/utils/classes";

import { type IconProps } from "@/icons/BaseIcon";

export const TimelineItem = ({
  icon: Icon,
  dark,
  right,
  children,
}: {
  icon: ComponentType<IconProps>;
  dark?: boolean;
  right?: boolean;
  children: ReactNode;
}) => (
  <li className="relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
    <span
      aria-hidden="true"
      className={classes(
        "absolute top-4 left-5 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full text-alveus-tan ring-4 ring-alveus-tan md:left-1/2",
        dark ? "bg-alveus-green-900" : "bg-alveus-green",
      )}
    >
      <Icon size={18} />
    </span>

    <div
      className={classes(
        "rounded-xl p-5",
        right && "md:col-start-2",
        dark
          ? "bg-alveus-green-900 text-alveus-tan"
          : "border border-alveus-green-200 bg-alveus-tan-50",
      )}
    >
      {children}
    </div>
  </li>
);

const Timeline = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto max-w-6xl">
    <div
      aria-hidden="true"
      className="absolute inset-y-0 left-5 w-1 -translate-x-1/2 overflow-clip rounded-full bg-alveus-green-200 md:left-1/2"
    >
      <div className="sticky inset-x-0 -top-1 bottom-0 mt-[-50vh] h-[calc(50vh+0.25rem)] bg-alveus-green" />
    </div>
    {children}
  </div>
);

export default Timeline;
