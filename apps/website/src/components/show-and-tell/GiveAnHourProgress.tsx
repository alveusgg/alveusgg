import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

const GiveAnHourProgressText = ({
  hours,
  target,
}: {
  hours: number;
  target: number;
}) => (
  <div className="flex justify-between px-2">
    <p className="text-md font-semibold text-alveus-tan">
      {hours === 0
        ? "No hours given yet"
        : `${hours} hour${hours !== 1 ? "s" : ""} already given`}
    </p>
    <p className="text-md font-medium text-alveus-tan opacity-75">
      {target} hour{target !== 1 ? "s" : ""} target
    </p>
  </div>
);

const barClasses =
  "absolute inset-y-0 left-0 min-w-10 rounded-full border-4 border-alveus-green-900 transition-all duration-[2s] ease-in-out";

export const GiveAnHourProgress = ({
  target,
  text = "after",
}: {
  target?: number;
  text?: "after" | "before";
}) => {
  const hoursQuery = trpc.showAndTell.getGiveAnHourProgress.useQuery(
    undefined,
    {
      refetchInterval: 5 * 60 * 1000,
    },
  );
  const hours = hoursQuery.data ?? 0;

  // Round hours up to the nearest multiple of 24
  // Or, if we're greater than 168 hours (7 days), the nearest multiple of 48
  // We'll multiply by 1.2 so that we never actually hit the target itself
  const multiple = hours > 168 ? 48 : 24;
  const computedTarget =
    target ?? Math.ceil(((hours || 1) * 1.2) / multiple) * multiple;

  return (
    <>
      {text === "before" && (
        <GiveAnHourProgressText hours={hours} target={computedTarget} />
      )}

      <div className="relative my-1 h-10 w-full rounded-full bg-alveus-green-900 shadow-lg">
        <div
          className={classes(barClasses, "bg-alveus-green")}
          style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
        />

        <div
          className={classes(
            barClasses,
            "bg-alveus-tan bg-gradient-to-r from-blue-800 to-green-600",
            hours === 0 ? "opacity-0" : "animate-pulse-slow",
          )}
          style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
        />
      </div>

      {text === "after" && (
        <GiveAnHourProgressText hours={hours} target={computedTarget} />
      )}
    </>
  );
};
