import type { CalendarEvent } from "@prisma/client";

import { getStandardCategoryColor } from "@/data/calendar-events";
import { classes } from "@/utils/classes";
import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";
import Link from "@/components/content/Link";

interface CalendarItemProps
  extends Omit<Parameters<typeof Link>[0], "children"> {
  event: CalendarEvent;
  today: Date;
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
        "mb-auto block rounded-sm p-1 leading-none transition-colors",
        event.startAt.getTime() < today.getTime() && "opacity-50",
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
