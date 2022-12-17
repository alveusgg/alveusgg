import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { z } from "zod";
import {formatErrors} from "../env/client.mjs";

export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;
const notificationsConfigSchema = z.object({
  categories: z.array(z.object({
    tag: z.string(),
    label: z.string(),
  }))
});

let config: NotificationsConfig;

export async function getNotificationsConfig() {
  if (config) {
    return config;
  }

  const _config = notificationsConfigSchema.safeParse(YAML.parse(await readFile("src/config/notifications.yaml", {
    encoding: "utf-8",
  })));

  if (!_config.success) {
    console.error(
        "❌ Invalid notifications config:\n",
        ...formatErrors(_config.error.format())
    );
    throw new Error("Invalid notifications config");
  }

  config = _config.data;
  return _config.data;
}