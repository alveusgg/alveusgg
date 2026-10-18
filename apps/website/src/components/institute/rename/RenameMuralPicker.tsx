import murals, { type MuralId } from "@/data/murals";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";

import Link from "@/components/content/Link";

import type { RenameMethodId } from "./methods";

export function RenameMuralPicker({
  muralId,
  method,
}: {
  muralId: MuralId;
  method: RenameMethodId | null;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {typeSafeObjectEntries(murals).map(([id, mural]) => {
        const isSelected = id === muralId;

        return (
          <Link
            key={id}
            // Keep the picked method when switching murals
            href={`/institute/pixels/${id}/rename${method ? `?via=${method}` : ""}`}
            scroll={false}
            custom
            aria-current={isSelected ? "page" : undefined}
            className={classes(
              "rounded-full px-5 py-2 text-xl font-bold shadow-md transition-colors",
              isSelected
                ? "bg-alveus-green text-alveus-tan"
                : "bg-alveus-green-100 text-alveus-green-800 hover:bg-alveus-green-200",
            )}
          >
            {mural.name}
          </Link>
        );
      })}
    </div>
  );
}
