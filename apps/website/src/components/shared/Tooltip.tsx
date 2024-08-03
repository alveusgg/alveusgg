import { Transition } from "@headlessui/react";
import type { ReactNode} from "react";
import { Fragment, useState } from "react";

export type TooltipProps = {
  content: string;
  children: ReactNode;
};

export function Tooltip({ content, children }: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      <Transition
        as={Fragment}
        show={showTooltip}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute bottom-full mb-0 w-max rounded bg-alveus-green-900 p-2 text-xs text-alveus-tan shadow-lg">
          {content}
        </div>
      </Transition>
    </div>
  );
}
