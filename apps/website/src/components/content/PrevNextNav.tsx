import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import Button from "@/components/content/Button";

import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";

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
  // Use on a dark (green) section, matching the Button variants
  dark?: boolean;
  className?: string;
};

const PrevNextLink = ({
  item,
  direction,
  dark,
}: {
  item: PrevNextItem;
  direction: "previous" | "next";
  dark: boolean;
}) => {
  const isNext = direction === "next";
  const Icon = isNext ? IconChevronRight : IconChevronLeft;

  return (
    <Button
      href={item.href}
      dark={dark}
      className={classes(
        "flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-1/2",
        dark
          ? "focus-visible:outline-alveus-tan"
          : "focus-visible:outline-alveus-green-700",
        isNext && "flex-row-reverse text-right sm:ml-auto",
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {item.image}
      <span className="min-w-0">
        <span className="block text-sm">{isNext ? "Next" : "Previous"}</span>
        <span className="block truncate font-serif font-bold">
          {item.label}
        </span>
      </span>
    </Button>
  );
};

// Previous/next links for stepping through a list of pages
const PrevNextNav = ({
  previous,
  next,
  label,
  dark = false,
  className,
}: PrevNextNavProps) => {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={label}
      className={classes(
        "flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between",
        className,
      )}
    >
      {previous && (
        <PrevNextLink item={previous} direction="previous" dark={dark} />
      )}
      {next && <PrevNextLink item={next} direction="next" dark={dark} />}
    </nav>
  );
};

export default PrevNextNav;
