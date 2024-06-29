import { type ComponentType, type RefAttributes, useCallback } from "react";

import type { Items } from "@/hooks/grouped";

export interface GroupedProps<T> {
  items: T[];
  option: string;
  group: string | null;
  name: string | null;
  index: number | null;
  size: number | null;
}

type Component<T, R extends HTMLElement> = ComponentType<
  GroupedProps<T> & RefAttributes<R>
>;

const Group = <T, R extends HTMLElement>({
  option,
  group,
  name,
  index,
  size,
  items,
  active,
  component: Component,
}: {
  option: string;
  group: string;
  name: string;
  index: number;
  size: number;
  items: T[];
  active: boolean;
  component: Component<T, R>;
}) => {
  // If this group is the "active" one in the URL, scroll it into view
  const scroll = useCallback(
    (node: HTMLElement | null) => {
      if (node && active) node.scrollIntoView({ behavior: "smooth" });
    },
    [active],
  );

  return (
    <Component
      ref={scroll}
      items={items}
      option={option}
      group={group}
      index={index}
      size={size}
      name={name}
    />
  );
};

const Grouped = <T, R extends HTMLElement>({
  option,
  group,
  result,
  component: Component,
}: {
  option: string;
  group: string | null;
  result: Items<T>;
  component: Component<T, R>;
}) => {
  return Array.isArray(result) ? (
    <Component
      items={result}
      option={option}
      group={group}
      name={null}
      index={null}
      size={null}
    />
  ) : (
    [...result.entries()].map(([key, val], idx) => (
      <Group
        key={key}
        option={option}
        group={key}
        name={val.name}
        index={idx}
        size={result.size}
        items={val.items}
        active={key === group}
        component={Component}
      />
    ))
  );
};

export default Grouped;
