import { type NextApiRequest, type NextApiResponse } from "next";
import { stringify } from "csv-stringify/sync";

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

const exportBingoEntries = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getServerAuthSession({ req, res });
  const hasPermissions = session?.user?.id
    ? checkPermissions(permissions.manageBingos, session.user)
    : false;

  if (!hasPermissions) {
    res.status(401).json({ success: false });
    return;
  }

  const bingoId = String(req.query.bingoId);
  const entries = await getAllEntriesForBingo(bingoId);

  const bingo = await prisma.bingo.findUnique({
    where: {
      id: bingoId,
    },
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

  const rows = entries.map((entry) => {
    const hasWon = cardsWithBingo.includes(entry.permutation);

    return [
      entry.bingoId,
      entry.id,
      entry.createdAt.toISOString(),
      String(entry.user.name),
      String(entry.permutation + 1),
      hasWon ? "yes" : "no",
      entry.claimedAt ? "yes" : "no",
      entry.claimedAt ? entry.claimedAt.toISOString() : "",
    ] satisfies string[];
  });

  rows.unshift([
    "bingoId",
    "id",
    "date",
    "username",
    "cardPermutation",
    "hasBingo",
    "hasClaimed",
    "claimedAt",
  ]);

  const csv = stringify(rows);

  res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader("Content-Disposition", "attachment; filename=bingo-entries.csv")
    .send(`\ufeff${csv}`); // add utf-8 BOM for Excel to correctly open the CSV
};

export default exportBingoEntries;
