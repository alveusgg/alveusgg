import { classes } from "@/utils/classes";

import Server from "./Server";

const led =
  "aspect-square rounded-full inset-ring-[0.1cqw] relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-1/2 after:size-2/5 after:rounded-full after:brightness-150 after:opacity-75";

const leds = {
  green: "bg-green-500 inset-ring-green-700 saturate-200 after:bg-green-500",
  red: "bg-red-500 inset-ring-red-700 saturate-200 after:bg-red-500",
  blue: "bg-blue-500 inset-ring-blue-700 saturate-200 after:bg-blue-500",
  gray: "bg-gray-900 inset-ring-black",
};

const Storage = ({
  size = 2,
  drives,
  title,
}: {
  size?: 1 | 2;
  drives?: boolean[];
  title?: string;
}) => (
  <Server
    size={size}
    title={title}
    left={
      <div className="flex h-full w-2/5 flex-col justify-end gap-[0.5cqw] p-[0.25cqw]">
        <div className={classes(led, leds.green)} />
        <div className={classes(led, leds.red)} />
        <div className={classes(led, leds.gray)} />
      </div>
    }
  >
    <div
      className={classes(
        "grid h-full grid-cols-4 gap-[0.25cqw]",
        size === 1 ? "grid-rows-[1fr_min-content]" : "grid-rows-3",
      )}
    >
      {size === 1 && (
        <div className="col-span-full h-full rounded-sm bg-gray-800" />
      )}
      {Array.from({ length: size === 1 ? 4 : 12 }, (_, i) => (
        <div
          key={i}
          className="flex aspect-[4/1] gap-[0.5cqw] rounded-sm bg-gray-800 p-[0.5cqw]"
        >
          <div className="grow rounded-sm bg-gray-900" />
          <div className="flex w-1/20 flex-col gap-[0.5cqw]">
            <div
              className={classes(
                led,
                !drives || drives[i] ? leds.blue : leds.gray,
              )}
            />
            <div className={classes(led, leds.gray)} />
          </div>
        </div>
      ))}
    </div>
  </Server>
);

export default Storage;
