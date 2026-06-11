import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from "@headlessui/react";
import { useMemo, useState } from "react";

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
      <Label className="mb-1 block text-sm font-medium text-alveus-tan">
        Search for your name
      </Label>
      <div className="relative">
        <ComboboxInput
          displayValue={(value: string | null) => value ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
        />
        {query.trim().length > 0 && (
          <ComboboxOptions
            as="ul"
            className="absolute top-full z-50 mt-1 w-full overflow-auto rounded-lg border border-white/20 bg-alveus-green-900 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-white/60">
                No results found
              </li>
            ) : (
              filtered.map((name) => (
                <ComboboxOption
                  key={name}
                  value={name}
                  as="li"
                  className="cursor-pointer px-4 py-2 text-sm text-white data-focus:bg-alveus-green-700"
                >
                  {name}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
