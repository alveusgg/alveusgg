import { useEffect, useReducer } from "react";
import { z } from "zod";

import { transposeMatrix } from "@/utils/math";
import { classes } from "@/utils/classes";
import {
  type BingoCard as BingoCardType,
  type BingoValue,
  bingoValueSchema,
  checkHasBingo,
  isCellPartOfBingo,
} from "@/utils/bingo";

import { BingoCardGrid } from "./BingoCardGrid";

type BingoLocalState = z.infer<typeof bingoLocalStateSchema>;
const bingoLocalStateSchema = z.object({
  restored: z.boolean(),
  selectedValues: z.array(bingoValueSchema),
});
type BingoAction =
  | {
      type: "SELECT" | "DESELECT";
      value: BingoValue;
    }
  | {
      type: "RESTORE";
      values?: BingoValue[];
    }
  | {
      type: "UPDATE_SELECTABLE";
      selectableValues: BingoValue[];
    }
  | {
      type: "RESET";
    };
const bingoStateReducer = (state: BingoLocalState, action: BingoAction) => {
  switch (action.type) {
    case "SELECT":
      return {
        ...state,
        selectedValues: [...state.selectedValues, action.value],
      };
    case "DESELECT":
      return {
        ...state,
        selectedValues: state.selectedValues.filter(
          (cell) => cell !== action.value,
        ),
      };
    case "UPDATE_SELECTABLE":
      return {
        ...state,
        selectedValues: state.selectedValues.filter((value) =>
          action.selectableValues.includes(value),
        ),
      };
    case "RESET":
      return {
        ...state,
        selectedValues: [],
      };
    case "RESTORE":
      return {
        ...state,
        selectedValues: action.values ?? state.selectedValues,
        restored: true,
      };
    default:
      return state;
  }
};

export function useBingoLocalState(bingoId: string) {
  const localStorageKey = `bingo-${bingoId}`;

  const [state, dispatch] = useReducer(bingoStateReducer, {
    restored: false,
    selectedValues: [],
  });

  useEffect(() => {
    let values: Array<BingoValue> | undefined;
    if (typeof localStorage !== "undefined") {
      const localState = localStorage.getItem(localStorageKey);
      if (localState) {
        try {
          values = bingoLocalStateSchema.parse(
            JSON.parse(localState),
          )?.selectedValues;
        } catch (e) {
          console.error(`Error restoring local bingo data: ${e}`);
        }
      }
    }

    dispatch({ type: "RESTORE", values });
  }, [localStorageKey]);

  useEffect(() => {
    if (state.restored && typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    }
  }, [bingoId, localStorageKey, state]);

  return [state, dispatch] as const;
}

type BingCardProps = {
  card: BingoCardType;
  selectedValues: Array<BingoValue>;
  selectableValues?: Array<BingoValue>;
  onSelect: (cellIndex: BingoValue) => void;
  onDeselect: (cellIndex: BingoValue) => void;
  onBingo: () => void;
};

export function BingoCard({
  card,
  selectedValues,
  selectableValues,
  onSelect,
  onDeselect,
  onBingo,
}: BingCardProps) {
  const size = card.length;
  const transposedCells = transposeMatrix(card);
  const [hasBingo, bingoMatch] = checkHasBingo(transposedCells, selectedValues);

  useEffect(() => {
    if (hasBingo) {
      onBingo();
    }
  }, [hasBingo, onBingo]);

  return (
    <div className="flex flex-col items-center justify-stretch gap-4 lg:flex-row lg:gap-12 xl:gap-24">
      <div className="relative flex w-full max-w-[600px] flex-shrink-0 flex-col">
        <BingoCardGrid
          className="w-full select-none gap-2 rounded-lg border border-white bg-black/80 p-2 text-lg font-bold tabular-nums shadow-2xl sm:text-4xl"
          size={size}
          showBingoHeader
          renderCell={(_, rowIndex, columnIndex) => {
            const cellValue = transposedCells[rowIndex]![columnIndex]!;
            const isSelected = selectedValues.includes(cellValue);
            const isSelectable =
              selectableValues === undefined ||
              selectableValues.includes(cellValue);
            const isBingoMatch =
              hasBingo &&
              isCellPartOfBingo(bingoMatch, size, rowIndex, columnIndex);

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
                      "flex w-full items-center justify-center rounded",
                      isBingoMatch
                        ? "border-red-600 bg-red-600"
                        : "text-bold bg-green-800 text-white",
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
                      "flex w-full transform items-center justify-center rounded transition-all",
                      isBingoMatch
                        ? "bg-red-500"
                        : isSelected
                          ? "bg-green-800 text-white"
                          : isSelectable
                            ? "bg-green-100 hover:scale-105 hover:bg-green-200 hover:shadow-lg lg:bg-green-50"
                            : "bg-white hover:scale-95 hover:bg-gray-200",
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
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
            <div className="rounded-xl border border-white/50 bg-red-700 px-6 py-4 text-5xl font-bold text-yellow-600 drop-shadow-xl">
              BINGO!
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 text-center text-lg lg:justify-center lg:text-left lg:text-xl 2xl:text-2xl">
        <div className="text-balance">
          You have a bingo card with 5&times;5 random numbers. During the game,
          numbers will be drawn and you can mark them on your card. Your goal is
          to get five numbers in a row, column or diagonal. The center square is
          a free space. You don&apos;t need to mark it.
        </div>

        <strong className="lg:mt-6 xl:mt-12">Drawn numbers:</strong>

        <div className="block text-balance">
          {selectableValues?.length
            ? selectableValues.map((value) => (
                <div
                  key={value}
                  className="m-1 inline-flex min-w-[2rem] items-center justify-center rounded-full bg-white p-2 leading-none"
                >
                  <span>{value}</span>
                </div>
              ))
            : "None"}
        </div>
      </div>
    </div>
  );
}
