import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from "@headlessui/react";
import { useMemo, useState } from "react";

import Box from "@/components/content/Box";

import IconSearch from "@/icons/IconSearch";
import IconX from "@/icons/IconX";

const MAX_SUGGESTIONS = 10;

type DonorTreeSearchProps = {
  names: string[];
  onSelect: (name: string) => void;
};

export default function DonorTreeSearch({
  names,
  onSelect,
}: DonorTreeSearchProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? names
          .filter((name) => name.toLowerCase().includes(normalized))
          .slice(0, MAX_SUGGESTIONS)
      : [];
  }, [names, query]);

  return (
    <Combobox
      value={selected}
      onChange={(value) => {
        setSelected(value);
        if (value) onSelect(value);
      }}
    >
      <Label className="sr-only">Search for your name</Label>
      <Box
        dark
        className="flex overflow-visible bg-alveus-green-800/75 p-0 backdrop-blur-xs"
      >
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setSelected(null);
          }}
          title="Clear search"
          disabled={!query.length}
          className="peer absolute inset-y-0 left-0 z-20 rounded-xl p-3 transition-colors hover:bg-alveus-green disabled:pointer-events-none"
        >
          {query.length ? (
            <IconX className="size-5" />
          ) : (
            <IconSearch className="m-0.5 size-4" />
          )}
        </button>

        <ComboboxInput
          displayValue={(value: string | null) => value ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your name on the trees..."
          className="shrink grow rounded-xl py-3 pl-10 text-sm transition-[padding] outline-none peer-hover:pl-12 placeholder:text-alveus-tan/75"
        />

        {/* Opens upward — the bar lives at the bottom of the page */}
        {query.trim().length > 0 && (
          <ComboboxOptions
            as="ul"
            className="absolute bottom-full left-0 z-30 mb-2 max-h-60 w-full overflow-auto rounded-xl bg-alveus-green-900 shadow-lg ring-1 ring-inset ring-white/15"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-alveus-tan/60">
                No results found
              </li>
            ) : (
              filtered.map((name) => (
                <ComboboxOption
                  key={name}
                  value={name}
                  as="li"
                  className="cursor-pointer px-4 py-2 text-sm text-alveus-tan data-focus:bg-alveus-tan/15"
                >
                  {name}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        )}
      </Box>
    </Combobox>
  );
}
