import { Transition } from "@headlessui/react";
import {
  Children,
  type ReactElement,
  type Ref,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

const Cycle = ({
  items,
  interval = 60,
}: {
  items: ReactElement<{ className: string; ref: Ref<HTMLElement> }>[];
  interval?: number;
}) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const cloned = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- we're passing a ref prop down
      items.map((item, idx) =>
        cloneElement(item, {
          className: classes(
            item.props.className,
            "transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300",
          ),
          ref: (el) => {
            refs.current[idx] = el;
          },
        }),
      ),
    [items],
  );

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const nextIndex = (index + 1) % items.length;
    const timeout = setTimeout(() => setIndex(nextIndex), interval * 1000);
    return () => clearTimeout(timeout);
  }, [index, items, interval]);

  return Children.map(cloned, (item, idx) => (
    <Transition
      show={idx === index}
      beforeEnter={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        ref.style.zIndex = "1";
      }}
      beforeLeave={() => {
        const ref = refs.current[idx];
        if (!ref) return;

        // Only offset if not absolute positioned
        if (window.getComputedStyle(ref).position !== "absolute") {
          // Offset by the width of the element and any gap between elements
          const { width } = ref.getBoundingClientRect();
          const gap = ref.parentElement
            ? Number(
                window
                  .getComputedStyle(ref.parentElement)
                  .rowGap.replace(/px$/, ""),
              )
            : 0;

          // If we're the last element, we need to offset an element that will be to the left of us
          ref.style[idx === items.length - 1 ? "marginLeft" : "marginRight"] =
            `-${width + gap}px`;
        }

        ref.style.zIndex = "0";
      }}
    >
      {item}
    </Transition>
  ));
};

export default Cycle;
