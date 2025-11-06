import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { type JSX } from "react";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";

import IconCheck from "@/icons/IconCheck";
import IconChevronVertical from "@/icons/IconChevronVertical";

type SelectProps = {
  options: Record<string, string | JSX.Element>;
  value: string;
  onChange: (value: string) => void;
  label?: string | JSX.Element;
  dark?: boolean;
  align?: "left" | "right";
  className?: string;
};

const Select = ({
  options,
  value,
  onChange,
  label,
  dark = false,
  align = "left",
  className,
}: SelectProps) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={classes("relative mt-1 flex flex-col", className)}>
        {label && <Label>{label}</Label>}
        <ListboxButton
          className={classes(
            "relative w-full rounded-lg border py-2 pr-10 pl-3 text-left",
            dark
              ? "border-alveus-tan/40 bg-alveus-green text-alveus-tan"
              : "border-alveus-green/40 bg-alveus-tan text-alveus-green dark:bg-gray-800 dark:text-alveus-tan",
          )}
        >
          <span className="block">{options[value]}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 dark:fill-white">
            <IconChevronVertical
              className="size-5 opacity-75"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <ListboxOptions
          transition
          className={classes(
            "group absolute top-full z-30 mt-1 flex max-h-60 min-w-[10rem] flex-col gap-0.5 overflow-auto rounded-md border p-2 shadow-lg transition-opacity duration-100 ease-in-out focus:outline-hidden data-[closed]:opacity-0",
            align === "left" ? "left-0" : "right-0",
            dark
              ? "border-alveus-tan/20 bg-alveus-green text-alveus-tan dark:bg-alveus-green-900"
              : "border-alveus-green/20 bg-alveus-tan dark:bg-gray-800 dark:text-alveus-tan",
          )}
          as="ul"
        >
          {typeSafeObjectEntries(options).map(([key, value]) => (
            <ListboxOption
              key={key}
              value={key}
              className={classes(
                "group relative w-full min-w-max cursor-pointer rounded py-2 pr-4 pl-10 data-[focus]:outline-blue-500 data-[focus]:group-focus-visible:outline",
                dark
                  ? "hover:bg-alveus-tan/20 data-[selected]:bg-alveus-tan/10"
                  : "hover:bg-alveus-green/20 data-[selected]:bg-alveus-green/10",
              )}
              as="li"
            >
              <span className="block">{value}</span>
              <span className="absolute inset-y-0 left-0 hidden items-center pl-3 group-data-[selected]:flex">
                <IconCheck className="size-5" aria-hidden="true" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};

export default Select;
