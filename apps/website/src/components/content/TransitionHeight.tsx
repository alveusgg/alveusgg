import { useRef } from "react";
import { Transition } from "@headlessui/react";

import { classes } from "@/utils/classes";

const TransitionHeight = ({
  show,
  enter,
  leave,
  children,
}: {
  show: boolean;
  enter?: string;
  leave?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const captureHeight = () =>
    ref.current &&
    (ref.current.style.height = `${ref.current.clientHeight || ref.current.scrollHeight}px`);
  const clearHeight = () => ref.current && (ref.current.style.height = "");

  return (
    <Transition
      ref={ref}
      as="div"
      show={show}
      enter={classes("transition-[height] overflow-hidden", enter)}
      enterFrom="!h-0"
      beforeEnter={captureHeight}
      afterEnter={clearHeight}
      leave={classes("transition-[height] overflow-hidden", leave)}
      leaveTo="!h-0"
      beforeLeave={captureHeight}
      afterLeave={clearHeight}
    >
      {children}
    </Transition>
  );
};

export default TransitionHeight;
