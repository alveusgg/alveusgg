import { classes } from "@/utils/classes";

import IconArrowRight from "@/icons/IconArrowRight";
import IconCheck from "@/icons/IconCheck";

import { type RenameMethodId, renameMethods } from "./methods";

export function RenameMethodCards({
  methods,
  selected,
  status,
  onSelect,
}: {
  methods: RenameMethodId[];
  selected: RenameMethodId | null;
  status: Partial<Record<RenameMethodId, string>>;
  onSelect: (method: RenameMethodId) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
      {methods.map((id) => {
        const method = renameMethods[id];
        const isSelected = selected === id;
        const label = status[id] ?? method.action;

        return (
          // A compact row on phones, a card from lg up
          <button
            key={id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(id)}
            className={classes(
              "relative isolate flex items-center gap-4 overflow-hidden rounded-xl p-3 text-start shadow-xl transition lg:flex-col lg:items-start lg:gap-2 lg:p-4",
              isSelected
                ? "bg-alveus-green text-alveus-tan"
                : "bg-alveus-green-100 text-alveus-green-800 hover:bg-alveus-green-200 hover:shadow-2xl lg:hover:scale-102",
            )}
          >
            <span className="flex min-w-0 grow items-center gap-4 lg:w-full lg:grow-0 lg:items-start">
              {/* The check sits on the icon, so selecting never changes the layout */}
              <span
                className={classes(
                  "relative shrink-0 rounded-xl p-2 transition-colors",
                  isSelected
                    ? "bg-alveus-tan text-alveus-green"
                    : "bg-alveus-green text-alveus-tan",
                )}
              >
                <method.icon size={24} />
                {isSelected ? (
                  <span className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-alveus-green-900 text-alveus-tan ring-2 ring-alveus-tan">
                    <IconCheck className="size-4" />
                  </span>
                ) : null}
              </span>
              {/* pt-1 centres the first line on the icon */}
              <span className="flex min-w-0 flex-col lg:pt-1">
                <span className="font-serif text-xl font-bold text-balance lg:text-2xl">
                  {method.title}
                </span>
                <span className="text-sm opacity-75 lg:hidden">{label}</span>
              </span>
            </span>

            <span className="hidden text-base lg:block">
              {method.description}
            </span>

            <span className="mt-auto hidden items-center gap-1 text-sm lg:flex">
              {status[id] ? <IconCheck className="size-4" /> : null}
              {label}
              {status[id] ? null : <IconArrowRight className="size-4" />}
            </span>

            <IconArrowRight
              className={classes(
                "size-5 shrink-0 opacity-75 lg:hidden",
                isSelected && "invisible",
              )}
            />

            {/* Soft inset border, as on Box */}
            <span
              aria-hidden
              className={classes(
                "pointer-events-none absolute inset-0 z-10 rounded-xl ring-4 ring-inset",
                isSelected ? "ring-white/15" : "ring-black/10",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
