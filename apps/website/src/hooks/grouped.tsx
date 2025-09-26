import { useRouter } from "next/router";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";

type ObjectKey<T> = Extract<keyof T, string>;

type MapKey<M extends Map<unknown, unknown>> =
  M extends Map<infer K, unknown> ? K : never;

export type GroupedItems<T> = Map<string, { name: string; items: T[] }>;

export type Items<T> = T[] | GroupedItems<T>;

export interface Options<T> {
  [key: string]: {
    label: string | JSX.Element;
    sort: (items: T[]) => Items<T>;
  };
}

type Props<T, O extends Options<T>, I extends ObjectKey<O>> = {
  items: T[];
  options: O;
  initial: I;
};

// For the dropdowns, we want to know the keys and labels of the options
type Dropdown<T, O extends Options<T>> = { [K in ObjectKey<O>]: O[K]["label"] };

// For the result, we want to know the type of the items returned by the sort function
// This is essentially the same as Items<T>, but allows for constraining the type if a constant is passed in
type Result<T, O extends Options<T>> = O[ObjectKey<O>] extends {
  sort: (items: T[]) => infer G;
}
  ? G
  : never;

// For each sort by option, if the option's sort function returns an object, we want to know the keys of that object
// Again, this is essentially the same as keyof GroupedItems<T>, but allows for constraining the type if a constant is passed in
type GroupKey<T, O extends Options<T>> = O[ObjectKey<O>] extends {
  sort: (items: T[]) => infer G;
}
  ? G extends GroupedItems<T>
    ? MapKey<G>
    : never
  : never;

const isOptionKey = <T, O extends Options<T>>(
  options: O,
  key: string | undefined,
): key is ObjectKey<O> => key !== undefined && key in options;

const useGrouped = <T, O extends Options<T>, I extends ObjectKey<O>>({
  items,
  options,
  initial,
}: Props<T, O, I>) => {
  const calcState = useCallback(
    (newOption: ObjectKey<O>, newGroup: GroupKey<T, O> | null = null) => {
      // The current items will either be an array of items, or an object of groups of items
      const newItems = options[newOption]?.sort(items) || [];

      return {
        option: newOption,
        // If we have a group, store it if it exists in the new results
        // `GroupKey<T, O>` doesn't give much type safety, so we check here
        group:
          newGroup && !Array.isArray(newItems) && newItems.has(newGroup)
            ? newGroup
            : null,
        result: newItems as Result<T, O>,
      };
    },
    [items, options],
  );

  // Track the active option, group and result
  const [state, setState] = useState(() => calcState(initial));

  const router = useRouter();

  // Allow the user to update the option and group
  const update = useCallback(
    (newOption: ObjectKey<O>, newGroup: GroupKey<T, O> | null) => {
      const newState = calcState(newOption, newGroup);
      setState(newState);

      // Update the URL anchor
      // If the option is the initial and there is no group, remove the anchor
      const hash =
        newState.group || newState.option !== initial
          ? `${newState.option}${newState.group ? `:${newState.group}` : ""}`
          : "";
      router.replace({ hash }, undefined, { scroll: false, shallow: true });
    },
    [calcState, initial, router],
  );

  // When the URL anchor changes, update the option and group
  const anchor = useCallback(() => {
    const hash = window.location.hash.slice(1);
    const [newOption, newGroup] = hash.split(":");

    // Only continue if the option is valid
    // `update` will ensure that the group is valid
    if (isOptionKey<T, O>(options, newOption)) {
      setState(calcState(newOption, (newGroup as GroupKey<T, O>) || null));
    }
  }, [calcState, options]);

  useEffect(() => {
    anchor();
    window.addEventListener("hashchange", anchor);
    return () => window.removeEventListener("hashchange", anchor);
  }, [anchor]);

  // Expose a clean, stable object for the dropdown
  const dropdown = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(options).map(([key, val]) => [key, val.label]),
      ) as Dropdown<T, O>,
    [options],
  );

  return {
    ...state,
    update,
    dropdown,
  };
};

export default useGrouped;

// const {
//   option,
//   group,
//   result,
//   update,
//   dropdown,
// } = useGrouped({
//   items: [1, 2, 3, 4],
//   options: {
//     test: {
//       label: 'Test',
//       sort: (items) => items
//     },
//     other: {
//       label: 'Other',
//       sort: (items) => new Map([['a', { name: 'A', items }]]),
//     },
//     more: {
//       label: 'More',
//       sort: (items) => new Map([['b', { name: 'B', items: items.filter(x => x % 2 === 0) }], ['c', { name: 'C', items: items.filter(x => x % 2 !== 0) }]]),
//     },
//   },
//   initial: 'test',
// });
