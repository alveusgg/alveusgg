import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";

import Link from "./Link";

export type PrevNextItem = {
  label: string;
  href: string;
  // Optional small image shown next to the label (decorative, so use alt="")
  image?: ReactNode;
};

type PrevNextNavProps = {
  previous?: PrevNextItem;
  next?: PrevNextItem;
  // Accessible name for the nav landmark, e.g. "Ambassadors"
  label: string;
  className?: string;
};

const PrevNextLink = ({
  item,
  direction,
}: {
  item: PrevNextItem;
  direction: "previous" | "next";
}) => {
  const isNext = direction === "next";
  const Icon = isNext ? IconChevronRight : IconChevronLeft;

  return (
    <Link
      href={item.href}
      custom
      className={classes(
        "flex min-w-0 items-center gap-3 rounded-xl border border-alveus-green-200 bg-alveus-tan-50 p-2 transition-colors hover:border-alveus-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
        isNext && "ml-auto flex-row-reverse text-right",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {item.image}
      <span className="min-w-0">
        <span className="block text-sm text-alveus-green-700">
          {isNext ? "Next" : "Previous"}
        </span>
        <span className="block truncate font-serif text-lg font-bold">
          {item.label}
        </span>
      </span>
    </Link>
  );
};

// Previous/next links for stepping through a list of pages
const PrevNextNav = ({
  previous,
  next,
  label,
  className,
}: PrevNextNavProps) => {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={label}
      className={classes("flex items-stretch justify-between gap-4", className)}
    >
      {previous && <PrevNextLink item={previous} direction="previous" />}
      {next && <PrevNextLink item={next} direction="next" />}
    </nav>
  );
};

export default PrevNextNav;
