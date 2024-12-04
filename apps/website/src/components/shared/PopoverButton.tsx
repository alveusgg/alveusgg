import { Fragment, type MouseEventHandler, type ReactNode } from "react";
import {
  Popover,
  PopoverButton as PopeoverButtonHeadless,
  PopoverPanel,
} from "@headlessui/react";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";

export function PopoverButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: ReactNode;
  onClick?: MouseEventHandler;
}) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopeoverButtonHeadless as={Fragment}>
            <Button
              width="auto"
              size="small"
              onClick={onClick}
              className={
                open
                  ? defaultButtonClasses
                  : "bg-gray-700/10 hover:bg-gray-700/20"
              }
            >
              {label}
            </Button>
          </PopeoverButtonHeadless>

          <PopoverPanel
            className="z-20 mt-0.5 rounded bg-gray-800 p-2 text-white shadow-xl"
            anchor="bottom end"
            modal={false}
          >
            {children}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
