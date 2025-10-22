import { findActiveBingo } from "@/server/db/bingos";

import {
  type BingoLiveData,
  calcBingoConfig,
  findCardsWithBingo,
  parseBingoPlayData,
} from "@/utils/bingo";

export const revalidate = 2;

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      bingo: string;
    }>;
  },
) {
  try {
    const { bingo: bingoSlugOrId } = await params;

    const bingo = await findActiveBingo(bingoSlugOrId);
    if (!bingo) {
      return new Response("Row not found", { status: 404 });
    }

    const { cards, numberOfCards } = calcBingoConfig(bingo.config);
    const { calledValues } = parseBingoPlayData(bingo.playData);
    const zeroAsFreespace = true; // TODO: make configurable

    const cardsWithBingo = findCardsWithBingo(
      cards,
      calledValues,
      zeroAsFreespace,
    );

    const liveData = {
      numberOfCards,
      calledValues,
      cardsWithBingo,
    } satisfies BingoLiveData;

    return Response.json(liveData, {
      status: 200,
      headers: {
        "Cache-Control": "max-age=1, s-maxage=2, stale-while-revalidate",
      },
    });
  } catch (e: unknown) {
    console.error(`${(e as Error).message}`);
    return new Response(`Failed to load bingo data`, {
      status: 500,
    });
  }
}
