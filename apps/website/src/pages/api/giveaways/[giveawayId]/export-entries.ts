import { type NextApiRequest, type NextApiResponse } from "next";
import { stringify } from "csv-stringify/sync";

import { getServerAuthSession } from "../../../../server/common/get-server-auth-session";
import { prisma } from "../../../../server/db/client";
import { checkIsSuperUser } from "../../../../utils/auth";

type GiveawayEntryCsvExportRow = string[];

const exportGiveawayEntries = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerAuthSession({ req, res });
  const isSuperUser = checkIsSuperUser(session);

  if (!isSuperUser) {
    res.status(401).json({ success: false });
    return;
  }

  const entries = await prisma.giveawayEntry.findMany({
    where: {
      giveawayId: String(req.query.giveawayId),
    },
    include: {
      mailingAddress: true,
      user: true,
    },
  });

  const rows: GiveawayEntryCsvExportRow[] = entries.map((entry) => {
    return [
      entry.giveawayId,
      entry.id,
      entry.createdAt.toISOString(),
      String(entry.user.name),
      String(entry.user.email),
      entry.givenName,
      entry.familyName,
      entry.email || "",
      entry.mailingAddress.addressLine1,
      entry.mailingAddress.addressLine2,
      entry.mailingAddress.postalCode,
      entry.mailingAddress.city,
      entry.mailingAddress.state,
      entry.mailingAddress.country,
    ];
  });

  rows.unshift([
    "giveawayId",
    "id",
    "date",
    "userUsername",
    "userEmail",
    "givenName",
    "familyName",
    "email",
    "addressLine1",
    "addressLine2",
    "postalCode",
    "city",
    "state",
    "country",
  ]);

  const csv = stringify(rows);

  res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader(
      "Content-Disposition",
      `attachment; filename=giveaway-entries.csv`
    )
    .send(csv);
};

export default exportGiveawayEntries;
