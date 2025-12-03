import type { DateTime } from "luxon";

import type { CalendarEvent } from "@alveusgg/database";

import { getStandardCategoryColor } from "@/data/calendar-events";

import { classes } from "@/utils/classes";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

import Link from "@/components/content/Link";

interface CalendarItemProps extends Omit<
  Parameters<typeof Link>[0],
  "children"
> {
  event: CalendarEvent;
  today: DateTime;
  timeZone?: string;
}

export function CalendarItem({
  event,
  today,
  className,
  timeZone,
  ...props
}: CalendarItemProps) {
  return (
    <Link
      className={classes(
        className,
        getStandardCategoryColor(event.category),
        "mb-auto block rounded-sm border-2 border-black/10 p-1 leading-none transition-colors hover:border-black/20",
        event.startAt.getTime() < today.toMillis() && "opacity-50",
      )}
      custom
      {...props}
    >
      <p className="font-semibold">{event.title}</p>
      {event.hasTime && (
        <p className="text-sm tabular-nums">
          {event.startAt.toLocaleTimeString(
            timeZone === DATETIME_ALVEUS_ZONE ? "en-US" : undefined,
            {
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
              timeZone,
            },
          )}
        </p>
      )}
    </Link>
  );
}
