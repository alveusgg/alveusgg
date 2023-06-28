import { readPackage } from "read-pkg";

import {
  createBotCommand,
  type CommandHandler,
} from "@/bot/commands/shared/command";

const versionPromise = readPackage().then(({ version }) => version);

export async function createVersionCommands() {
  const versionCommand: CommandHandler = async (params, { reply }) => {
    const version = await versionPromise;
    reply(`AlveusGG Bot v${version}`);
  };

  return [
    createBotCommand("ggv", versionCommand),
    createBotCommand("ggversion", versionCommand),
  ];
}
