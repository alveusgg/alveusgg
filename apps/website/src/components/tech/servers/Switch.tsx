import { classes } from "@/utils/classes";

import Server from "./Server";

// This component makes use of percentage + cqw (container query width) units.
// This ensures it scales to whatever container it is within, similar to an SVG.

const Ports = ({
  count,
  rows,
  type,
}: {
  count: number;
  rows: 1 | 2;
  type: "rj45" | "sfp";
}) => (
  <div
    className={classes(
      "grid grid-flow-col gap-x-[0.25cqw] gap-y-[0.75cqw]",
      rows === 1 ? "grid-rows-1" : "grid-rows-2",
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        className={classes(
          "relative aspect-[3/2] w-[2.85cqw] rounded-xs bg-gray-900",
          // Each block of 8 ports has a gap to the right, except the last one
          (i + 1) % (rows === 1 ? 8 : 16) === 0 &&
            i !== count - 1 &&
            "mr-[0.5cqw]",
          // Final port, if odd, should be on the second row, not the first
          rows === 2 && i === count - 1 && i % 2 === 0 && "row-start-2",
          // RJ45 ports have yellow/green connectivity indicators
          type === "rj45" &&
            "before:absolute before:top-0 before:left-0 before:aspect-[3/2] before:w-1/4 before:rounded-xs before:bg-yellow-500/50 before:content-['']",
          type === "rj45" &&
            "after:absolute after:top-0 after:right-0 after:aspect-[3/2] after:w-1/4 after:rounded-xs after:bg-green-500/50 after:content-['']",
          // SFP ports have a white connectivity indicator
          type === "sfp" &&
            "after:absolute after:aspect-square after:w-1/5 after:rounded-xs after:bg-white/50 after:content-['']",
          type === "sfp" &&
            rows === 1 &&
            "after:-top-1/2 after:left-1/2 after:-translate-x-1/2",
          // With two rows, the SFP connectivity indicators are between the two rows
          type === "sfp" &&
            rows === 2 &&
            (i % 2 === 0
              ? "after:-bottom-1/3 after:left-1/6"
              : "after:-top-1/3 after:right-1/6"),
        )}
        key={i}
      />
    ))}
  </div>
);

const Switch = ({
  screen = true,
  drives = 0,
  rj45 = 24,
  sfp = 2,
  rows = 1,
  title,
}: {
  screen?: boolean;
  drives?: 0 | 1 | 2 | 3 | 4;
  rj45?: number;
  sfp?: number;
  rows?: 1 | 2;
  title?: string;
}) => (
  <Server size={1} title={title}>
    <div className="flex h-full justify-between gap-[2cqw]">
      {screen && (
        <div className="relative my-auto aspect-square w-1/15 shrink-0 rounded-sm bg-blue-900">
          <div className="absolute inset-y-0 left-1/2 h-full w-px -translate-x-1/2 bg-blue-500" />
          <div className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-blue-500" />
          <div className="absolute top-1/2 left-1/2 size-2/5 -translate-1/2 rounded-full bg-blue-900 ring-1 ring-blue-500" />
          <div className="absolute top-1/2 left-1/2 size-1/5 -translate-1/2 rounded-full bg-white/75" />
        </div>
      )}

      <div className="flex grow flex-col gap-[0.25cqw]">
        <div className="flex gap-[0.25cqw]">
          {!screen && (
            <div className="h-[0.5cqw] w-[calc((1/15*100%)+2cqw)] rounded-sm bg-blue-500" />
          )}
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="h-[0.5cqw] grow rounded-sm bg-gray-900" key={i} />
          ))}
        </div>

        <div className="my-auto flex justify-end gap-[0.75cqw]">
          {!!drives && (
            <div
              className={classes(
                "flex items-center gap-[0.75cqw]",
                drives > 1 && "mr-auto",
              )}
            >
              {Array.from({ length: drives }).map((_, i) => (
                <div
                  className="relative aspect-[5/1] h-[4.5cqw] rounded-sm border-[0.25cqw] border-gray-600"
                  key={i}
                >
                  <div className="h-full w-[0.25cqw] bg-gray-600" />
                  <div className="absolute top-1/2 right-1/15 aspect-square h-1/6 -translate-y-1/2 rounded-full bg-white/75" />
                </div>
              ))}
            </div>
          )}
          {!!rj45 && <Ports count={rj45} rows={rows} type="rj45" />}
          {!!sfp && <Ports count={sfp} rows={rows} type="sfp" />}
        </div>
      </div>
    </div>
  </Server>
);

export default Switch;
