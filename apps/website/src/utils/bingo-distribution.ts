import { readFile } from "node:fs/promises";

import { assignCardToUser } from "@/utils/bingo";

(async () => {
  const numberOfCards = 50;
  const eventId = "alveus fall carvinal 2023";
  const distribution: Record<number, number> = {};

  const names = await readFile("./User.csv", "utf-8");
  const namesArray = names.split("\n");
  for (const name of namesArray) {
    const number = await assignCardToUser(name, numberOfCards, eventId);
    console.log(`${name} = ${number}`);
    distribution[number] = (distribution[number] || 0) + 1;
  }

  const max = Math.max(...Object.values(distribution));
  const min = Math.min(...Object.values(distribution));
  const average =
    Object.values(distribution).reduce((a, b) => a + b, 0) /
    Object.values(distribution).length;

  // Draw a histogram using ascii characters
  const histogram = Object.entries(distribution)
    .map(([key, value]) => {
      const bar = Math.round((value / max) * 100);
      return `${key} ${value} ${"#".repeat(bar)}`;
    })
    .join("\n");

  console.log(histogram);

  console.log(`Min: ${min}`);
  console.log(`Max: ${max}`);
  console.log(`Average: ${average}`);
})();
