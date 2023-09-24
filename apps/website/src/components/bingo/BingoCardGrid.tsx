import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

export function BingoCardGrid({
  className,
  size,
  renderCell,
  showBingoHeader: shouldShowBingoHeader = false,
}: {
  className?: string;
  size: number;
  showBingoHeader?: boolean;
  renderCell: (
    cellIndex: number,
    rowIndex: number,
    columnIndex: number,
  ) => ReactNode;
}) {
  const showBingoHeader = size === 5 && shouldShowBingoHeader;

  return (
    <div
      className={classes("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${size}, 2fr)`,
        gridTemplateRows: `${showBingoHeader && `1fr `}repeat(${size}, 2fr)`,
      }}
    >
      {showBingoHeader && (
        <>
          <div className="flex items-center justify-center text-white">B</div>
          <div className="flex items-center justify-center text-white">I</div>
          <div className="flex items-center justify-center text-white">N</div>
          <div className="flex items-center justify-center text-white">G</div>
          <div className="flex items-center justify-center text-white">O</div>
        </>
      )}

      {new Array(size * size).fill(0).map((_, cellIndex) => {
        const rowIndex = Math.floor(cellIndex / size);
        const columnIndex = cellIndex % size;

        return (
          <div
            key={`${cellIndex}`}
            className="flex aspect-square items-stretch"
          >
            {renderCell(cellIndex, rowIndex, columnIndex)}
          </div>
        );
      })}
    </div>
  );
}
