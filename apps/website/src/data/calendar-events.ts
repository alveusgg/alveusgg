type StandardCategory = {
  name: string;
};

export const standardCategories: StandardCategory[] = [
  { name: "Alveus Regular Stream" },
  { name: "Alveus Special Stream" },
  { name: "Alveus YouTube Video" },
  { name: "Maya Regular Stream" },
  { name: "Maya YouTube Video" },
  { name: "Collaboration Stream" },
] as const;

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
