import { lstatSync, readFileSync } from "node:fs";

import { z } from "zod";

import {
  onlyArgs,
  parseArgs,
  required,
  writePrivateJson,
} from "./lib/backfill";
import { archiveTwitchCampaign } from "./lib/twitch-archive";

async function main() {
  const args = parseArgs();
  onlyArgs(args, ["help", "token-file", "broadcaster-id", "out"]);
  if (args.has("help")) {
    console.log(
      "Read-only: --token-file=/private/user-token --broadcaster-id=ID --out=/private/campaign.json",
    );
    return;
  }
  const path = required(args, "token-file");
  const stat = lstatSync(path);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0)
    throw new Error("Token file must be private and regular");
  const token = readFileSync(path, "utf8").trim();
  if (!token) throw new Error("Empty token");
  const broadcasterId = required(args, "broadcaster-id");
  const validationResponse = await fetch(
    "https://id.twitch.tv/oauth2/validate",
    {
      headers: { Authorization: `OAuth ${token}` },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!validationResponse.ok) throw new Error("Token validation failed");
  const validation = z
    .object({
      user_id: z.string(),
      client_id: z.string(),
      scopes: z.array(z.string()),
    })
    .parse(await validationResponse.json());
  if (
    validation.user_id !== broadcasterId ||
    !validation.scopes.includes("channel:read:charity")
  )
    throw new Error("Incorrect user or scope");
  const result = await archiveTwitchCampaign(broadcasterId, async (path) => {
    const response = await fetch(`https://api.twitch.tv/helix/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": validation.client_id,
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`Twitch request failed (${response.status})`);
    return response.json();
  });
  writePrivateJson(required(args, "out"), result);
  console.log(
    JSON.stringify({
      donations: result.donationCount,
      amountCents: result.amountCents,
      sha256: result.donationsSha256,
    }),
  );
}

main().catch(() => {
  console.error(
    "Export failed. Check token permissions, active campaign, pagination and private output path.",
  );
  process.exitCode = 1;
});
