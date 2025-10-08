import { DateTime } from "luxon";
import { useMemo } from "react";

import type { PartialDateString } from "@/utils/datetime-partial";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";
import { trpc } from "@/utils/trpc";

import useLocaleString from "@/hooks/locale";

import Progress from "../content/Progress";

export type DateString = PartialDateString & `${number}-${number}-${number}`;

export const parseDateString = (date: DateString, offset?: number) =>
  DateTime.fromFormat(date, "yyyy-MM-dd")
    .startOf("day")
    .plus({ days: offset ?? 0 })
    .setZone(DATETIME_ALVEUS_ZONE, { keepLocalTime: true })
    .toJSDate();

const useDateString = (date?: DateString, offset?: number) =>
  useMemo(() => date && parseDateString(date, offset), [date, offset]);

const useLocaleDays = (hours: number) => {
  const localeDays = useLocaleString(Math.floor(hours / 24));

  return `${hours % 24 === 0 ? "" : "~"}${localeDays} day${Math.floor(hours / 24) !== 1 ? "s" : ""}`;
};

const useLocaleHours = (hours: number, showDays: boolean) => {
  const localeHours = useLocaleString(hours);
  const localeDays = useLocaleDays(hours);

  return `${localeHours} hour${hours !== 1 ? "s" : ""}${showDays ? ` (${localeDays})` : ""}`;
};

const targetIntervals = [24 * 180, 24 * 90, 24 * 30, 24 * 2];

const getTarget = (hours: number, ended: boolean) => {
  const multiple = targetIntervals.find((interval) => interval <= hours) ?? 24;
  const round = ended ? Math.floor : Math.ceil;
  return round((hours + 1) / multiple) * multiple;
};

const GiveAnHourProgressText = ({
  hours,
  target,
  isLoading = false,
  ended = false,
}: {
  hours: number;
  target: number;
  isLoading?: boolean;
  ended?: boolean;
}) => {
  // Show the equivalent number of days if we're over 72 hours
  const showDays = target > 72;
  const localeHours = useLocaleHours(hours, showDays);
  const localeTarget = useLocaleHours(target, showDays);

  return (
    <div className="flex justify-between px-2">
      <p className="font-semibold">
        {isLoading
          ? "Loading hours given…"
          : hours === 0
            ? `No hours given${ended ? "" : " yet"}`
            : `${localeHours}${ended ? "" : " already"} given`}
      </p>
      {!ended && (
        <p className="font-medium opacity-75">{localeTarget} target</p>
      )}
    </div>
  );
};

export const GiveAnHourProgress = ({
  target,
  start,
  end,
  text = "after",
}: {
  target?:
    | number
    | ((hours: number, ended: boolean, computed: number) => number);
  start?: DateString;
  end?: DateString;
  text?: "after" | "before";
}) => {
  const startDate = useDateString(start);
  const endDate = useDateString(end, 1); // `end` is exclusive in the API, but treated as inclusive as a prop here
  const ended = useMemo(() => {
    if (!endDate) return false;
    const now = new Date();
    return now >= endDate;
  }, [endDate]);

  const hoursQuery = trpc.showAndTell.getGiveAnHourProgress.useQuery(
    {
      start: startDate,
      end: endDate,
    },
    {
      refetchInterval: 5 * 60 * 1000,
    },
  );
  const hours = hoursQuery.data ?? 0;

  const computedTarget = useMemo(() => {
    if (typeof target === "number") return target;

    const computed = getTarget(hours, ended);
    if (typeof target === "undefined") return computed;

    return target(hours, ended, computed);
  }, [target, hours, ended]);
  const progress = Math.min((hours / computedTarget || 0) * 100, 100);

  return (
    <>
      {text === "before" && (
        <GiveAnHourProgressText
          hours={hours}
          target={computedTarget}
          isLoading={hoursQuery.isPending}
          ended={ended}
        />
      )}

      <Progress progress={progress} dark />

      {text === "after" && (
        <GiveAnHourProgressText
          hours={hours}
          target={computedTarget}
          isLoading={hoursQuery.isPending}
          ended={ended}
        />
      )}
    </>
  );
};
