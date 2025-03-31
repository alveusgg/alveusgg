interface Channel {
  id: string;
  name: string;
  uri: string;
}

export const channels = {
  alveus: {
    id: "UCbJ-1yM55NHrR1GS9hhPuvg",
    name: "Alveus Sanctuary",
    uri: "https://www.youtube.com/@AlveusSanctuary",
  },
  highlights: {
    id: "UCfisf6HxiQr8_4mctNBm9cQ",
    name: "Alveus Highlights",
    uri: "https://www.youtube.com/@AlveusSanctuaryHighlights",
  },
} as const satisfies Record<string, Channel>;
