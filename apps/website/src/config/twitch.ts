import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { z } from "zod";
import { formatErrors } from "../env/client.mjs";

export type TwitchConfig = z.infer<typeof twitchConfigSchema>;
const twitchConfigSchema = z.object({
  channels: z.record(
    z.string(),
    z.object({
      id: z.coerce.string(),
      label: z.string(),
      notifications: z.object({
        live: z.boolean().optional(),
      }),
    })
  ),
});

let config: TwitchConfig;

export async function getTwitchConfig() {
  if (config) {
    return config;
  }

  const _config = twitchConfigSchema.safeParse(
    YAML.parse(
      await readFile("src/config/twitch.yaml", {
        encoding: "utf-8",
      })
    )
  );

  if (!_config.success) {
    console.error(
      "❌ Invalid twitch config:\n",
      ...formatErrors(_config.error.format())
    );
    throw new Error("Invalid twitch config");
  }

  config = _config.data;
  return _config.data;
}
