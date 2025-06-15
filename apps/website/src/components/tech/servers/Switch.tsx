import { classes } from "@/utils/classes";

import Server from "./Server";

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
          (i + 1) % (rows === 1 ? 8 : 16) === 0 &&
            i !== count - 1 &&
            "mr-[0.5cqw]",
        )}
        key={i}
      >
        {type === "rj45" && (
          <>
            <div className="absolute top-0 left-0 aspect-[3/2] w-1/4 rounded-xs bg-yellow-500/50" />
            <div className="absolute top-0 right-0 aspect-[3/2] w-1/4 rounded-xs bg-green-500/50" />
          </>
        )}

        {type === "sfp" &&
          (rows === 1 ? (
            <div className="absolute -top-1/2 left-1/2 aspect-square w-1/4 -translate-x-1/2 rounded-xs bg-white/50" />
          ) : (
            <div
              className={classes(
                "absolute aspect-square w-1/5 rounded-xs bg-white/50",
                i % 2 === 0 ? "-bottom-1/3 left-1/6" : "-top-1/3 right-1/6",
              )}
            />
          ))}
      </div>
    ))}
  </div>
);

const Switch = ({
  rj45 = 24,
  sfp = 2,
  rows = 1,
}: {
  rj45?: number;
  sfp?: number;
  rows?: 1 | 2;
}) => (
  <Server size={1}>
    <div className="flex h-full justify-between gap-[2cqw]">
      <div className="relative my-auto aspect-square h-3/4 rounded-sm bg-blue-900">
        <div className="absolute inset-y-0 left-1/2 h-full w-px -translate-x-1/2 bg-blue-500" />
        <div className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-blue-500" />
        <div className="absolute top-1/2 left-1/2 size-2/5 -translate-1/2 rounded-full bg-blue-900 ring-1 ring-blue-500" />
        <div className="absolute top-1/2 left-1/2 size-1/5 -translate-1/2 rounded-full bg-white/75" />
      </div>

      <div className="flex grow flex-col gap-[0.25cqw]">
        <div className="flex gap-[0.25cqw]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="h-[0.5cqw] grow rounded-sm bg-gray-900" key={i} />
          ))}
        </div>

        <div className="my-auto flex justify-end gap-[0.75cqw]">
          {!!rj45 && <Ports count={rj45} rows={rows} type="rj45" />}
          {!!sfp && <Ports count={sfp} rows={rows} type="sfp" />}
        </div>
      </div>
    </div>
  </Server>
);

export default Switch;
