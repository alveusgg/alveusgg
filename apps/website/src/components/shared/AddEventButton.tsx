import { Fragment } from "react";
import { PopoverButton as PopoverButtonHeadless } from "@headlessui/react";

import { env } from "@/env";

import IconCalendar from "@/icons/IconCalendar";
import IconGoogleCalendar from "@/icons/IconGoogleCalendar";
import IconOutlook from "@/icons/IconOutlook";

import { Button } from "@/components/shared/form/Button";
import { PopoverButton } from "@/components/shared/PopoverButton";

const ICS_FEED_NAME = "Alveus announcement";

type IcsEvent = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date | null;
  url: string;
};

type AddEventButtonProps = {
  event: IcsEvent;
};

function formatIcsDate(date: Date): string {
  return (
    date
      .toISOString() // UTC
      .slice(0, -5) // remove MS and Z
      .replace(/[:-]/g, "") + // Remove colons and dashes
    "Z"
  );
}

function createIcsEvent(event: IcsEvent): string {
  const { hostname } = new URL(env.NEXT_PUBLIC_BASE_URL);

  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${hostname}//Notifications Event`,
      `X-WR-CALNAME:${ICS_FEED_NAME}`,
      `NAME:${ICS_FEED_NAME}`,
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `UID:${event.id}@${hostname}`,
      `DTSTART:${formatIcsDate(event.startTime)}`,
      event.endTime && `DTEND:${formatIcsDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description} ${event.url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter((str): str is string => str !== null)
      // Split every 72 characters and add a new line (CRLF) with one space
      .map((str) => str.match(/.{1,72}/g)?.join("\r\n ") ?? str)
      .join("\r\n")
  );
}

export function AddEventButton({ event }: AddEventButtonProps) {
  const handleGCalClick = () => {
    const { title, description, startTime, endTime, url } = event;
    const googleCalendarEventUrl = new URL(
      "https://www.google.com/calendar/render",
    );
    googleCalendarEventUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarEventUrl.searchParams.append("text", title + " " + url);
    googleCalendarEventUrl.searchParams.append(
      "dates",
      `${formatIcsDate(startTime)}/${formatIcsDate(endTime || startTime)}`,
    );
    googleCalendarEventUrl.searchParams.append("details", description);

    window.open(googleCalendarEventUrl, "_blank");
  };

  const handleIcsClick = () => {
    const blob = new Blob([createIcsEvent(event)], {
      type: "text/calendar;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "event.ics";
    link.target = "_blank";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <PopoverButton
      label={
        <>
          <IconCalendar className="mr-1 size-5" />
          Add to calendar
        </>
      }
    >
      <div className="flex gap-2">
        <PopoverButtonHeadless as={Fragment}>
          <Button
            width="auto"
            size="small"
            onClick={handleGCalClick}
            title="Save event to Google calendar"
          >
            <IconGoogleCalendar className="mr-2 size-5" />
            Google
          </Button>
        </PopoverButtonHeadless>
        <PopoverButtonHeadless as={Fragment}>
          <Button
            width="auto"
            size="small"
            onClick={handleIcsClick}
            title="Save event to Apple/Outlook calendar"
          >
            <IconOutlook className="mr-2 size-5" />
            Apple/Outlook
          </Button>
        </PopoverButtonHeadless>
      </div>
    </PopoverButton>
  );
}
