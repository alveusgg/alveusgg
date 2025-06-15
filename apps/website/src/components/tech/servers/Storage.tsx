import { classes } from "@/utils/classes";

const led = "size-4 rounded-full inset-ring-2";

const leds = {
  green: "bg-green-500 inset-ring-green-700 saturate-200",
  red: "bg-red-500 inset-ring-red-700 saturate-200",
  blue: "bg-blue-500 inset-ring-blue-700 saturate-200",
  gray: "bg-gray-900 inset-ring-black",
};

const Front = ({ size, drives }: { size: 1 | 2; drives?: boolean[] }) => {
  return (
    <div
      className={classes(
        size === 1 ? "h-32" : "h-64",
        "flex gap-1 rounded-sm bg-gray-400 p-1",
      )}
    >
      <div className="flex w-12 flex-col">
        <div className="mt-auto flex flex-col gap-2 p-1">
          <div className={classes(led, leds.green)} />
          <div className={classes(led, leds.red)} />
          <div className={classes(led, leds.gray)} />
        </div>
      </div>
      <div className="grid grow grid-cols-4 gap-1">
        {size === 1 && (
          <div className="col-span-full h-9 rounded-sm bg-gray-800" />
        )}
        {Array.from({ length: size === 1 ? 4 : 12 }, (_, i) => (
          <div key={i} className="flex h-20 gap-2 rounded-sm bg-gray-800 p-2">
            <div className="grow rounded-sm bg-gray-900" />
            <div className="flex flex-col gap-2">
              {!drives || drives[i] ? (
                <div className={classes(led, leds.blue)} />
              ) : (
                <div className={classes(led, leds.gray)} />
              )}
              <div className={classes(led, leds.gray)} />
            </div>
          </div>
        ))}
      </div>
      <div className="w-12" />
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
