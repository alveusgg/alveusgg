import { classes } from "@/utils/classes";
import {
  type BingoCard,
  type BingoValue,
  checkHasBingo,
  isCellPartOfBingo,
} from "@/utils/bingo";

import { BingoCardGrid } from "./BingoCardGrid";

export function BingoCard({
  size,
  card,
  selectedValues,
  selectableValues,
  onSelect,
  onDeselect,
}: {
  size: number;
  card: BingoCard;
  selectedValues: Array<BingoValue>;
  selectableValues?: Array<BingoValue>;
  onSelect: (cellIndex: BingoValue) => void;
  onDeselect: (cellIndex: BingoValue) => void;
}) {
  const [hasBingo, match] = checkHasBingo(card, selectedValues);

  return (
    <div className="relative w-full max-w-[600px]">
      <BingoCardGrid
        className="w-full gap-2 rounded-lg border border-white bg-gray-800 p-2 text-lg font-bold tabular-nums shadow-2xl sm:text-3xl md:text-4xl"
        size={size}
        showBingoHeader
        renderCell={(_, rowIndex, columnIndex) => {
          const cellValue = card[rowIndex]![columnIndex]!;
          const isSelected = selectedValues.includes(cellValue);
          const isSelectable =
            selectableValues === undefined ||
            selectableValues.includes(cellValue);
          const isBingoMatch =
            hasBingo && isCellPartOfBingo(match, size, rowIndex, columnIndex);

          return (
            <div
              className={classes(
                "flex h-full w-full rounded",
                isBingoMatch && "ring-4 ring-red-800 ring-offset-0",
              )}
            >
              {cellValue === 0 ? (
                <div
                  className={classes(
                    "flex w-full items-center justify-center rounded bg-gray-300",
                    isBingoMatch ? "border-red-600 bg-red-600" : "bg-gray-300",
                  )}
                >
                  Free
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isSelectable) return;

                    if (isSelected) {
                      onDeselect(cellValue);
                    } else {
                      onSelect(cellValue);
                    }
                  }}
                  disabled={!isSelectable}
                  className={classes(
                    "flex w-full transform items-center justify-center rounded border border-transparent transition-transform",
                    isBingoMatch
                      ? "border-red-600 bg-red-600"
                      : isSelected
                      ? "bg-green-600"
                      : isSelectable
                      ? "border-green-600 bg-green-50 hover:scale-105 hover:bg-green-100 hover:shadow-lg"
                      : "bg-gray-100 hover:scale-95 hover:bg-gray-200",
                  )}
                >
                  {cellValue}
                </button>
              )}
            </div>
          );
        }}
      />

      {hasBingo && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 text-5xl font-bold text-red-600">
          BINGO!
        </div>
      )}
    </div>
  );
}
