import type { MouseEvent } from "react";
import { Disclosure } from "@headlessui/react";
import React, { Fragment } from "react";
import IconCalendar from "@/icons/IconCalendar";
import { Button } from "@/components/shared/Button";
import IconGoogleCalendar from "@/icons/IconGoogleCalendar";
import IconOutlook from "@/icons/IconOutlook";
import { env } from "@/env/client.mjs";

const ICS_FEED_NAME = "Alveus announcement";

type IcsEvent = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
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
      .replace(/[:\-]/g, "") + // Remove colons and dashes
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
      `DTEND:${formatIcsDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description} ${event.url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      // Split every 72 characters and add a new line (CRLF) with one space
      .map((str) => str.match(/.{1,72}/g)?.join("\r\n ") ?? str)
      .join("\r\n")
  );
}

export function AddEventButton({ event }: AddEventButtonProps) {
  const handleGCalClick = () => {
    const { title, description, startTime, endTime, url } = event;
    const googleCalendarEventUrl = new URL(
      "https://www.google.com/calendar/render"
    );
    googleCalendarEventUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarEventUrl.searchParams.append("text", title + " " + url);
    googleCalendarEventUrl.searchParams.append(
      "dates",
      `${formatIcsDate(startTime)}/${formatIcsDate(endTime)}`
    );
    googleCalendarEventUrl.searchParams.append("details", description);

    window.open(googleCalendarEventUrl, "_blank");
  };

  const handleIcsClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

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
    <div className="relative">
      <Disclosure>
        <Disclosure.Button as={Fragment}>
          <Button width="auto" size="small">
            <IconCalendar className="mr-1 h-5 w-5" />
            Add to calendar
          </Button>
        </Disclosure.Button>
        <Disclosure.Panel className="absolute right-0 z-20 mt-0.5 rounded bg-gray-800 p-2 text-white shadow-xl">
          <div className="flex gap-2">
            <Button
              width="auto"
              size="small"
              onClick={handleGCalClick}
              title="Save event to Google calendar"
            >
              <IconGoogleCalendar className="mr-2 h-5 w-5" />
              Google
            </Button>
            <Button
              width="auto"
              size="small"
              onClick={handleIcsClick}
              title="Save event to Apple/Outlook calendar"
            >
              <IconOutlook className="mr-2 h-5 w-5" />
              Apple/Outlook
            </Button>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
}
