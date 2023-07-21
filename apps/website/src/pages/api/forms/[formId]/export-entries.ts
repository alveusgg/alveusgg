import { type NextApiRequest, type NextApiResponse } from "next";
import { stringify } from "csv-stringify/sync";

import { getCountryName } from "@/utils/countries";
import { getServerAuthSession } from "@/server/common/get-server-auth-session";
import { checkIsSuperUserSession } from "@/server/utils/auth";
import { getAllEntriesForForm } from "@/server/db/forms";

type FormEntryCsvExportRow = string[];

const exportFormEntries = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  const isSuperUser = checkIsSuperUserSession(session);

  if (!isSuperUser) {
    res.status(401).json({ success: false });
    return;
  }

  const entries = await getAllEntriesForForm(String(req.query.formId));

  const rows: FormEntryCsvExportRow[] = entries.map((entry) => {
    return [
      entry.formId,
      entry.id,
      entry.createdAt.toISOString(),
      String(entry.user.name),
      String(entry.user.email),
      entry.givenName,
      entry.familyName,
      entry.email || "",
      entry.allowMarketingEmails ? "yes" : "no",
      entry.mailingAddress?.addressLine1 || "",
      entry.mailingAddress?.addressLine2 || "",
      entry.mailingAddress?.postalCode || "",
      entry.mailingAddress?.city || "",
      entry.mailingAddress?.state || "",
      entry.mailingAddress?.country || "",
      (entry.mailingAddress?.country &&
        getCountryName(entry.mailingAddress.country)) ||
        "",
    ];
  });

  rows.unshift([
    "formId",
    "id",
    "date",
    "userUsername",
    "userEmail",
    "givenName",
    "familyName",
    "email",
    "allowMarketingEmails",
    "addressLine1",
    "addressLine2",
    "postalCode",
    "city",
    "state",
    "countryCode",
    "country",
  ]);

  const csv = stringify(rows);

  res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader("Content-Disposition", `attachment; filename=form-entries.csv`)
    .send("\ufeff" + csv); // add utf-8 BOM for Excel to correctly open the CSV
};

export default exportFormEntries;
