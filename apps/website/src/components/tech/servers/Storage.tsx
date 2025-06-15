import { classes } from "@/utils/classes";

const led =
  "aspect-square rounded-full inset-ring-[0.1cqw] relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-1/2 after:size-2/5 after:rounded-full after:brightness-150 after:opacity-75";

const leds = {
  green: "bg-green-500 inset-ring-green-700 saturate-200 after:bg-green-500",
  red: "bg-red-500 inset-ring-red-700 saturate-200 after:bg-red-500",
  blue: "bg-blue-500 inset-ring-blue-700 saturate-200 after:bg-blue-500",
  gray: "bg-gray-900 inset-ring-black",
};

const Front = ({ size, drives }: { size: 1 | 2; drives?: boolean[] }) => {
  return (
    <div
      className={classes(
        // Rack width is 19 inches, 1U is 1.75 inches, 2U is 3.5 inches
        size === 1 ? "aspect-[19/1.75]" : "aspect-[19/3.5]",
        "@container flex w-full gap-[0.25cqw] rounded-sm bg-gray-400 p-[0.25cqw]",
      )}
    >
      <div className="flex w-1/25 flex-col">
        <div className="mt-auto flex w-2/5 flex-col gap-[0.5cqw] p-[0.25cqw]">
          <div className={classes(led, leds.green)} />
          <div className={classes(led, leds.red)} />
          <div className={classes(led, leds.gray)} />
        </div>
      </div>
      <div
        className={classes(
          "grid grow grid-cols-4 gap-1",
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
      <div className="w-1/25" />
    </div>
  );
};

const Storage = ({
  size = 2,
  drives,
}: {
  size?: 1 | 2;
  drives?: boolean[];
}) => <Front size={size} drives={drives} />;

export default Storage;
