import invariant from "@/utils/invariant";
import { transposeMatrix } from "@/utils/math";
import { z } from "zod";

type BingoTypeDef = {
  label: string;
};

export type BingoType = (typeof bingoTypes)[number];
export type GenerateableBingoTypes = Extract<BingoType, "75-ball">;

export const bingoTypes = ["75-ball"] as const;

export const bingoTypeDefs = {
  "75-ball": {
    label: "75-Ball",
  },
} as const satisfies Record<BingoType, BingoTypeDef>;

export type CalculatedBingoConfig = z.infer<typeof bingoConfigSchema>;

export function isBingoType(type: string): type is BingoType {
  return bingoTypes.includes(type as unknown as BingoType);
}

export type BingoValue = z.infer<typeof bingoValueSchema>;
export type BingoCard = z.infer<typeof bingoCardSchema>;
export type BingoCards = z.infer<typeof bingoCardsSchema>;

export const bingoValueSchema = z.number().or(z.string());
export const bingoCardSchema = z.array(z.array(bingoValueSchema));
export const bingoCardsSchema = z.array(bingoCardSchema);

// Play data saved to the database
export type BingoPlayData = z.infer<typeof bingoPlayDataSchema>;
export const bingoPlayDataSchema = z.object({
  calledValues: z.array(bingoValueSchema),
});

// Live data sent to the client
export type BingoLiveData = z.infer<typeof bingoLiveDataSchema>;
export const bingoLiveDataSchema = z.object({
  numberOfCards: z.number(),
  calledValues: z.array(bingoValueSchema),
  cardsWithBingo: z.array(z.number()),
});

export const bingoConfigSchema = z.object({
  numberOfCards: z.number(),
  size: z.number(),
  //freeSpace?: z.number().optional(),
  //words?: z.array(z.string()).optional(),
  cards: bingoCardsSchema,
});

export const getDefaultBingoConfig = () =>
  ({
    numberOfCards: 50,
    size: 5,
    cards: [],
  }) satisfies CalculatedBingoConfig;

export function calcBingoConfig(bingoConfig?: string) {
  const config: CalculatedBingoConfig = getDefaultBingoConfig();
  if (bingoConfig) {
    const parsedConfig = bingoConfigSchema.safeParse(JSON.parse(bingoConfig));
    if (parsedConfig.success) {
      Object.assign(config, parsedConfig.data);
    }
  }

  return config;
}

export function parseBingoPlayData(playData?: string): BingoPlayData {
  try {
    if (playData) {
      const parsed = bingoPlayDataSchema.safeParse(JSON.parse(playData));
      if (parsed.success) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    calledValues: [],
  };
}

export function assignCardToUser(
  userName: string,
  numberOfCards: number,
  bingoId: string,
) {
  return distributeNameToNumber(userName + bingoId, 0, numberOfCards - 1);
}

// NOTE: could be a general util
async function distributeNameToNumber(
  name: string,
  min = 1,
  max = 50,
): Promise<number> {
  // TODO: Add a salt to the name so users do not always get the same number

  const encoder = new TextEncoder();
  const data = encoder.encode(name);

  // Compute the hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);

  // Compute the sum of the hash
  const sum = hashArray[0]! + hashArray[1]! + hashArray[2]!;

  // Return a number between min and max
  return (sum % (max - min + 1)) + min;
}

export function generateBingoCard(
  type: GenerateableBingoTypes,
  size: number,
  freeSpace?: number,
) {
  invariant(type === "75-ball", "Invalid bingo type");

  const card = [];
  const freeSpaceCol = freeSpace && Math.round(freeSpace / size);
  for (let i = 0; i < size; i++) {
    const column = getNumbers(size, 1 + i * size * 3, (i + 1) * size * 3);
    if (freeSpace && freeSpaceCol === i) {
      column.splice(freeSpace % size, 1, 0);
    }
    card.push(column);
  }
  return card;
}

function getNumbers(num: number, min: number, max: number) {
  const availableNumbers = new Array(max - min + 1)
    .fill(0)
    .map((_, i) => i + min);
  const numbers = [];
  for (let i = 0; i < num; i++) {
    const availableLeft = availableNumbers.length - 1;
    const index = Math.round(Math.random() * availableLeft);
    numbers.push(availableNumbers[index]!);
    availableNumbers.splice(index, 1);
  }
  return numbers;
}

export function generateBingoCards(
  type: GenerateableBingoTypes,
  numberOfCards: number,
  size: number,
  freeSpace?: number,
) {
  const cards: BingoCards = [];
  for (let i = 0; i < numberOfCards; i++) {
    cards.push(generateBingoCard(type, size, freeSpace));
  }
  return cards;
}

function checkBingoRow(
  row: BingoCard[number],
  calledValues: BingoValue[],
  zeroAsFreespace = true,
) {
  return row.every(
    (cellValue) =>
      (zeroAsFreespace && cellValue === 0) || calledValues.includes(cellValue),
  );
}

function checkBingoRows(
  card: BingoCard,
  calledValues: BingoValue[],
  zeroAsFreespace = true,
): number | false {
  const size = card.length;
  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    if (checkBingoRow(card[rowIndex]!, calledValues, zeroAsFreespace)) {
      return rowIndex;
    }
  }
  return false;
}

type BingoMatch = {
  type: "row" | "column" | "diagonal";
  index: number;
};

type BingoWin = [false] | [true, BingoMatch];

export function isCellPartOfBingo(
  match: BingoMatch,
  size: number,
  rowIndex: number,
  columnIndex: number,
) {
  return (
    (match.type === "row" && match.index === rowIndex) ||
    (match.type === "column" && match.index === columnIndex) ||
    (match.type === "diagonal" &&
      match.index === 1 &&
      rowIndex === columnIndex) ||
    (match.type === "diagonal" &&
      match.index === 2 &&
      rowIndex === size - 1 - columnIndex)
  );
}

export function checkHasBingo(
  card: BingoCard,
  calledValues: BingoValue[],
  zeroAsFreespace = true,
): BingoWin {
  // Return true if any row has all numbers called, any column has all numbers called, or any diagonal has all numbers called
  // If zeroAsFreespace is true, then 0 is treated as a free space and is always considered called
  const size = card.length;

  // Check rows
  const row = checkBingoRows(card, calledValues, zeroAsFreespace);
  if (row !== false) {
    return [true, { type: "row", index: row }];
  }
  // Check columns by transposing the matrix
  const column = checkBingoRows(
    transposeMatrix(card),
    calledValues,
    zeroAsFreespace,
  );
  if (column !== false) {
    return [true, { type: "column", index: column }];
  }

  // Check diagonals (only if size is odd, otherwise there are no diagonals)
  if (size % 2 !== 1) {
    return [false];
  }

  // There are two diagonals to check:
  // top-left to bottom-right
  const diagonal1 = card.map((row, i) => row[i]!);
  if (checkBingoRow(diagonal1, calledValues, zeroAsFreespace)) {
    return [true, { type: "diagonal", index: 1 }];
  }

  // top-right to bottom-left
  const diagonal2 = card.map((row, i) => row[size - i - 1]!);
  if (checkBingoRow(diagonal2, calledValues, zeroAsFreespace)) {
    return [true, { type: "diagonal", index: 2 }];
  }

  // Otherwise, no bingo
  return [false];
}

export function findCardsWithBingo(
  cards: BingoCards,
  calledValues: BingoValue[],
  zeroAsFreespace = true,
) {
  return cards
    .map(
      (card, cardId) =>
        [cardId, checkHasBingo(card, calledValues, zeroAsFreespace)] as const,
    )
    .filter(([_, hasBingo]) => hasBingo[0])
    .map(([cardId]) => cardId);
}
