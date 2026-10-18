import { Transition } from "@headlessui/react";
import {
  type ReactNode,
  type RefCallback,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CycleItemProps = {
  className?: string;
  // Must be attached to the item's root element, so we know if it rendered anything
  ref: RefCallback<Element>;
};

const Cycle = ({
  items,
  className,
  interval = 60,
}: {
  items: Record<string, (props: CycleItemProps) => ReactNode>;
  className?: string;
  interval?: number;
}) => {
  const refs = useRef<(Element | null)[]>([]);
  const count = Object.keys(items).length;

  const [index, setIndex] = useState(0);
  const next = useCallback(
    (check = false) => {
      setIndex((prev) => {
        // If we have no items, stay where we are
        if (count === 0) {
          return prev;
        }

        // If check is true, only advance if the current ref is null
        // However, if the current index is beyond the items length, we must advance
        if (check && prev < count) {
          const currentRef = refs.current[prev];
          if (currentRef) {
            return prev;
          }
        }

        // Move to the next item that has a ref
        let next = (prev + 1) % count;
        while (!refs.current[next]) {
          next = (next + 1) % count;

          if (next === prev) {
            // All refs are null, stay on the current index
            return prev;
          }
        }
        return next;
      });
    },
    [count],
  );

  // Whenever index changes, start a timer for cycling to the next item
  useEffect(() => {
    const timeout = setTimeout(next, interval * 1000);
    return () => clearTimeout(timeout);
  }, [index, next, interval]);

  const entries = useMemo(
    () =>
      Object.entries(items).map(([key, render], idx) => ({
        key,
        render,
        // Whenever an item is (un)mounted, update the ref and check if we need to advance
        ref: (el: Element | null) => {
          // eslint-disable-next-line react-hooks/refs -- this is a ref callback, only called when the item (un)mounts
          const previous = refs.current[idx];
          refs.current[idx] = el;

          if (previous !== el && !!previous !== !!el) {
            next(true);
          }
        },
      })),
    [items, next],
  );

  return entries.map(({ key, render, ref }, idx) => (
    <Transition
      key={key}
      unmount={false}
      show={idx === index}
      appear={idx !== 0}
      as="div"
      className="contents *:z-0 *:transition-opacity data-closed:*:opacity-0 data-enter:*:z-10 data-enter:*:duration-700 data-leave:*:duration-300"
    >
      {render({ className, ref })}
    </Transition>
  ));
};

export default Cycle;
