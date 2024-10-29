type StandardCategory = {
  name: string;
  color: string;
};

export const standardCategories: StandardCategory[] = [
  { name: "Alveus Regular Stream", color: "bg-yellow-400 hover:bg-yellow-600" },
  { name: "Alveus Special Stream", color: "bg-green-300 hover:bg-green-500" },
  {
    name: "Alveus Collaboration Stream",
    color: "bg-blue-300 hover:bg-blue-500",
  },
  { name: "Alveus YouTube Video", color: "bg-red-300 hover:bg-red-500" },
  { name: "Maya Stream", color: "bg-gray-200 hover:bg-gray-400" },
  { name: "Maya YouTube Video", color: "bg-red-200 hover:bg-red-400" },
] as const;

export const getStandardCategoryColor = (category: string) =>
  standardCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase().trim(),
  )?.color ?? "bg-gray-100 hover:bg-gray-300";

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
