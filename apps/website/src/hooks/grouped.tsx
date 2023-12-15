import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type ObjectKey<T> = Extract<keyof T, string>;

type MapKey<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;

export type Grouped<T> = Map<string, { name: string; items: T[] }>;

type Items<T> = T[] | Grouped<T>;

export interface Options<T> {
  [key: string]: {
    label: string;
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
// Again, this is essentially the same as keyof Grouped<T>, but allows for constraining the type if a constant is passed in
type GroupKey<T, O extends Options<T>> = O[ObjectKey<O>] extends {
  sort: (items: T[]) => infer G;
}
  ? G extends Grouped<T>
    ? MapKey<G>
    : never
  : never;

const useGrouped = <T, O extends Options<T>, I extends ObjectKey<O>>({
  items,
  options,
  initial,
}: Props<T, O, I>) => {
  // Track the active option
  const [option, setOption] = useState<ObjectKey<O>>(initial);

  // Track the active group
  // Will be a key from an option that returns an object of items
  const [group, setGroup] = useState<GroupKey<T, O> | null>(null);

  // Track the current items
  // Will either be an array of items, or an object of groups of items
  const [result, setResult] = useState<Result<T, O>>(
    (options[initial]?.sort(items) || []) as Result<T, O>,
  );

  // Allow the user to update the option and group
  const update = useCallback(
    (newOption: ObjectKey<O>, newGroup: GroupKey<T, O> | null) => {
      // Store the selected option
      setOption(newOption);

      // Store the new results
      const newResult = options[newOption]?.sort(items) || [];
      setResult(newResult as Result<T, O>);

      // If we have a group, store it if it exists in the new results
      // `GroupKey<T, O>` doesn't give much type safety, so we check here
      if (newGroup && !Array.isArray(newResult) && newResult.has(newGroup)) {
        setGroup(newGroup);
      } else {
        setGroup(null);
      }
    },
    [items, options],
  );

  // Track if we've done an initial anchor check
  // Ensures we don't immediately overwrite the URL anchor with the initial option
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  // When the option or group changes, update the URL anchor
  // If the option is the initial and there is no group, remove the anchor
  useEffect(() => {
    if (!checked) return;

    const url = new URL(window.location.href);
    url.hash =
      group || option !== initial ? `${option}${group ? `:${group}` : ""}` : "";

    router.replace(url.toString(), undefined, { scroll: false });
  }, [checked, option, group, initial]);

  // When the URL anchor changes, update the option and group
  const anchor = useCallback(() => {
    const url = new URL(window.location.href);
    const hash = url.hash.slice(1);
    const [newOption, newGroup] = hash.split(":");

    // Only continue if the option is valid
    // `update` will ensure that the group is valid
    if (newOption && newOption in options) {
      update(newOption as ObjectKey<O>, (newGroup as GroupKey<T, O>) || null);
    }

    // Mark that we've done an initial check
    setChecked(true);
  }, [options, update]);

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
    option,
    group,
    result,
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
