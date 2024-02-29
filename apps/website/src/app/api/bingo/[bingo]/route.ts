import { Client } from "@planetscale/database";
import {
  type BingoType,
  type BingoLiveData,
  calcBingoConfig,
  parseBingoPlayData,
  findCardsWithBingo,
} from "@/utils/bingo";

import { env } from "@/env";

export const runtime = "edge";
export const revalidate = 2;

const db = new Client({
  url: env.DATABASE_URL,
});

export async function GET(
  req: Request,
  {
    params: { bingo: bingoSlugOrId },
  }: {
    params: {
      bingo: string;
    };
  },
) {
  try {
    const conn = db.connection();
    const bingo = (
      await conn.execute(
        "SELECT * FROM Bingo b WHERE b.active = 1 AND b.startAt > NOW() AND (endAt IS NULL OR b.endAt > NOW()) AND b.id = ? OR b.slug = ? LIMIT 1",
        [bingoSlugOrId, bingoSlugOrId],
        { as: "object" },
      )
    ).rows?.[0] as {
      type: BingoType;
      label: string;
      config: string;
      playData: string;
    };
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
