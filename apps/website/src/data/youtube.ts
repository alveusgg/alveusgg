interface Channel {
  id: string;
  name: string;
}

export const channels = {
  alveus: {
    id: "UCbJ-1yM55NHrR1GS9hhPuvg",
    name: "Alveus Sanctuary",
  },
  highlights: {
    id: "UCfisf6HxiQr8_4mctNBm9cQ",
    name: "Alveus Highlights",
  },
} as const satisfies Record<string, Channel>;
