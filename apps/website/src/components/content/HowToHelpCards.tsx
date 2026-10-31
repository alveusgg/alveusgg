import { type ComponentProps } from "react";

import { classes } from "@/utils/classes";

import Donate from "./Donate";

type HowToHelpCardsProps = {
  items: readonly ComponentProps<typeof Donate>[];
  className?: string;
};

// A row of the donate page's cards, with icons, where every card in the row
// stretches to the height of the tallest one. The row also gives these cards a
// visible keyboard focus ring and no hover zoom when reduced motion is on.
const HowToHelpCards = ({ items, className }: HowToHelpCardsProps) => (
  <ul className={classes("grid gap-8 md:grid-cols-3", className)}>
    {items.map((item) => (
      <li
        key={item.type}
        className="flex flex-col *:flex *:grow *:flex-col *:motion-reduce:transition-none *:motion-reduce:hover:scale-100 [&_a]:grow [&_a]:focus-visible:outline-2 [&_a]:focus-visible:-outline-offset-4 [&_a]:focus-visible:outline-alveus-tan"
      >
        <Donate {...item} />
      </li>
    ))}
  </ul>
);

export default HowToHelpCards;
