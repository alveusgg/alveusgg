import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

import { getServerAuthSession } from "@/server/common/get-server-auth-session";
import { checkPermissions } from "@/server/utils/auth";
import { getAllEntriesForBingo } from "@/server/db/bingos";
import {
  calcBingoConfig,
  findCardsWithBingo,
  parseBingoPlayData,
} from "@/utils/bingo";
import { permissions } from "@/data/permissions";

const winners = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  const hasPermissions = session?.user?.id
    ? await checkPermissions(permissions.manageBingos, session.user)
    : false;

  if (!hasPermissions) {
    res.status(401).json({ success: false });
    return;
  }

  const bingoId = String(req.query.bingoId);

  const bingo = await prisma.bingo.findUnique({
    where: { id: bingoId },
  });
  if (!bingo) {
    res
      .status(404)
      .json({ success: false, error: "Could not find bingo data!" });
    return;
  }

  const { cards } = calcBingoConfig(bingo.config);
  const { calledValues } = parseBingoPlayData(bingo.playData);
  const zeroAsFreespace = true; // TODO: make configurable

  const cardsWithBingo = findCardsWithBingo(
    cards,
    calledValues,
    zeroAsFreespace,
  );

  const onlyClaimed = String(req.query.claimed) === "true";

  const entries = await getAllEntriesForBingo(bingoId);
  const rows = entries
    .filter((entry) => !onlyClaimed || entry.claimedAt !== null)
    .filter((entry) => cardsWithBingo.includes(entry.permutation))
    .map((entry) => String(entry.user.name));

  res
    .status(200)
    .setHeader("Content-Type", "application/json")
    .send(JSON.stringify(rows));
};

export default winners;
