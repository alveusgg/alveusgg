import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { classes } from "@/utils/classes";
import IconCheck from "@/icons/IconCheck";
import IconChevronVertical from "@/icons/IconChevronVertical";

type SelectProps = {
  options: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
  label?: string | JSX.Element;
  dark?: boolean;
  align?: "left" | "right";
  className?: string;
};

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  dark = false,
  align = "left",
  className,
}) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={classes("relative mt-1 flex flex-col", className)}>
        {label && <Listbox.Label>{label}</Listbox.Label>}
        <Listbox.Button
          className={classes(
            "relative w-full rounded-lg border py-2 pl-3 pr-10 text-left",
            dark
              ? "border-alveus-tan/40 bg-alveus-green text-alveus-tan"
              : "border-alveus-green/40 bg-alveus-tan text-alveus-green",
          )}
        >
          <span className="block">{options[value]}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <IconChevronVertical
              className="h-5 w-5 opacity-75"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={classes(
              "group absolute top-full z-30 mt-1 flex max-h-60 min-w-[10rem] flex-col gap-0.5 overflow-auto rounded-md border p-2 shadow-lg focus:outline-none",
              align === "left" ? "left-0" : "right-0",
              dark
                ? "border-alveus-tan/20 bg-alveus-green text-alveus-tan"
                : "border-alveus-green/20 bg-alveus-tan text-alveus-green",
            )}
          >
            {typeSafeObjectEntries(options).map(([key, value]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={classes(
                      "relative w-full min-w-max cursor-pointer rounded py-2 pl-10 pr-4",
                      dark
                        ? "hover:bg-alveus-tan/20"
                        : "hover:bg-alveus-green/20",
                      active && "outline-blue-500 group-focus-visible:outline",
                      selected &&
                        (dark ? "bg-alveus-tan/10" : "bg-alveus-green/10"),
                    )}
                  >
                    <span className="block">{value}</span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <IconCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Select;
