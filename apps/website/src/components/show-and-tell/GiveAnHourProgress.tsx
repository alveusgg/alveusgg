const GiveAnHourProgressText = ({
  hours,
  target,
}: {
  hours: number;
  target: number;
}) => (
  <div className="flex justify-between px-2 pb-2">
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

export const GiveAnHourProgress = ({
  hours = 0,
  target,
  text = "after",
}: {
  hours?: number;
  target?: number;
  text?: "after" | "before";
}) => {
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

      <div className="relative h-8 w-full rounded-full bg-alveus-green-900">
        <div
          className="absolute inset-y-0 left-0 min-w-8 rounded-full border-4 border-alveus-green-900 bg-alveus-green"
          style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
        />

        {hours > 0 && (
          <div
            className="absolute inset-y-0 left-0 min-w-8 animate-pulse-slow rounded-full border-4 border-alveus-green-900 bg-alveus-tan"
            style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
          />
        )}
      </div>

      {text === "after" && (
        <GiveAnHourProgressText hours={hours} target={computedTarget} />
      )}
    </>
  );
};
