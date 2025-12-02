import { Transition } from "@headlessui/react";
import {
  Children,
  type ReactElement,
  type Ref,
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

const Cycle = ({
  items,
  className,
  interval = 60,
}: {
  items: ReactElement<{ className: string; ref: Ref<HTMLElement> }>[];
  className?: string;
  interval?: number;
}) => {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const [index, setIndex] = useState(0);
  const next = useCallback(
    (check = false) => {
      setIndex((prev) => {
        // If check is true, only advance if the current ref is null
        // However, if the current index is beyond the items length, we must advance
        if (check && prev < items.length) {
          const currentRef = refs.current[prev];
          if (currentRef) {
            return prev;
          }
        }

        // Move to the next item that has a ref
        let next = (prev + 1) % items.length;
        while (!refs.current[next]) {
          next = (next + 1) % items.length;

          if (next === prev) {
            // All refs are null, stay on the current index
            return prev;
          }
        }
        return next;
      });
    },
    [items.length],
  );

  // Whenever index changes, start a timer for cycling to the next item
  useEffect(() => {
    const timeout = setTimeout(next, interval * 1000);
    return () => clearTimeout(timeout);
  }, [index, next, interval]);

  const cloned = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- we're passing a ref prop down
      items.map((item, idx) =>
        cloneElement(item, {
          className: classes(
            item.props.className,
            className,
            "z-0 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
          ),
          // Whenever an item is (un)mounted, update the ref and check if we need to advance
          ref: (el) => {
            const previous = refs.current[idx];
            refs.current[idx] = el;

            if (previous !== el && !!previous !== !!el) {
              next(true);
            }
          },
        }),
      ),
    [items, className, next],
  );

  return Children.map(cloned, (item, idx) => (
    <Transition
      unmount={false}
      show={idx === index}
      appear={idx !== 0}
      beforeEnter={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        ref.style.zIndex = "1";
      }}
      beforeLeave={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        ref.style.zIndex = "0";
      }}
    >
      {item}
    </Transition>
  ));
};

export default Cycle;
