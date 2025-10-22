import { type DateObjectUnits } from "luxon";

import { type CalendarEvent } from "@alveusgg/database";

type StandardCategory = {
  name: string;
  color: string;
};

export const standardCategories: StandardCategory[] = [
  {
    name: "Alveus Regular Stream",
    color: "bg-yellow-200 hover:bg-yellow-300 group-hover:bg-yellow-300",
  },
  {
    name: "Alveus Special Stream",
    color: "bg-green-100 hover:bg-green-200 group-hover:bg-green-200",
  },
  {
    name: "Alveus Collaboration Stream",
    color: "bg-blue-100 hover:bg-blue-50 group-hover:bg-blue-50",
  },
  {
    name: "Alveus Ambassador Birthday",
    color: "bg-pink-100 hover:bg-pink-200 group-hover:bg-pink-200",
  },
  {
    name: "Alveus YouTube Video",
    color: "bg-red-50 hover:bg-red-100 group-hover:bg-red-100",
  },
  {
    name: "Maya Stream",
    color: "bg-gray-200 hover:bg-gray-300 group-hover:bg-gray-300",
  },
  {
    name: "Maya YouTube Video",
    color: "bg-red-100 hover:bg-red-50 group-hover:bg-red-50",
  },
] as const;

export const getStandardCategoryColor = (category: string) =>
  standardCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase().trim(),
  )?.color ?? "bg-gray-100 hover:bg-gray-300 group-hover:bg-gray-300";

type FrequentLink = {
  label: string;
  url: string;
};

export const frequentLinks: FrequentLink[] = [
  {
    label: "Alveus Twitch",
    url: "https://twitch.tv/AlveusSanctuary",
  },
  {
    label: "Alveus YouTube",
    url: "https://youtube.com/@AlveusSanctuary",
  },
  {
    label: "Maya Twitch",
    url: "https://twitch.tv/maya",
  },
  {
    label: "Maya YouTube",
    url: "https://youtube.com/@mayahiga",
  },
] as const;

const truncate = (value: string, max: number) => {
  if (value.length <= max) return value;

  for (const pattern of [" - ", " | ", ": "]) {
    const index = value.indexOf(pattern);
    if (index !== -1 && index < max) return value.slice(0, index);
  }

  return value.slice(0, max - 3) + "…";
};

// Used for the overlay + Twitch sync, showing the title + link (if not the Twitch channel)
export const getFormattedTitle = (
  event: CalendarEvent,
  channel?: string,
  length?: number,
) => {
  const title = length ? truncate(event.title, length) : event.title;
  return channel && new RegExp(`twitch\\.tv\\/${channel}`, "i").test(event.link)
    ? title
    : `${title} @ ${event.link.toLowerCase().replace(/^(https?:)?\/\/(www\.)?/, "")}`;
};

type RegularEvent = Pick<
  CalendarEvent,
  "title" | "description" | "category" | "link"
> & {
  startTime?: Pick<DateObjectUnits, "hour" | "minute">;
};

const animalCareChats: RegularEvent = {
  title: "Animal Care Chats",
  description:
    "Join animal care staff as they carry out their daily tasks and answer your questions.",
  category: "Alveus Regular Stream",
  link: "https://twitch.tv/AlveusSanctuary",
  startTime: { hour: 10, minute: 30 },
};

const mayaStream: RegularEvent = {
  title: "Maya Stream",
  description: "Tune in to see what Maya is up to today!",
  category: "Maya Stream",
  link: "https://twitch.tv/maya",
  startTime: { hour: 10, minute: 0 },
};

export const regularEventsWeekly = [
  // Monday
  [mayaStream, animalCareChats],
  // Tuesday
  [animalCareChats],
  // Wednesday
  [
    mayaStream,
    {
      title: "Dan Stream",
      description: "Join Dan as he gets work done around the sanctuary.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 10, minute: 30 },
    },
    {
      title: "Chat Chats w/ Evan",
      description:
        "Join Evan as he chats all things bugs with chat and answers all your questions.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 21, minute: 0 },
    },
  ],
  // Thursday
  [
    {
      title: "Lukas Stream",
      description: "Join Lukas as he gets work done around the sanctuary.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 10, minute: 30 },
    },
  ],
  // Friday
  [
    {
      title: "Show & Tell",
      description:
        "Join Maya as she reviews this week's community submissions for Show and Tell.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 14, minute: 30 },
    },
  ],
  // Saturday
  [
    {
      title: "Connor Stream",
      description: "Join Connor as he gets up to his usual antics.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 14, minute: 30 },
    },
  ],
  // Sunday
  [
    {
      title: "Mucking in the Morning",
      description: "Join Chandler as he mucks out the pasture.",
      category: "Alveus Regular Stream",
      link: "https://twitch.tv/AlveusSanctuary",
      startTime: { hour: 11, minute: 0 },
    },
  ],
] as RegularEvent[][];
