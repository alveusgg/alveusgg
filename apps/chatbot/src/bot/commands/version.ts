import { readPackage } from "read-pkg";

import {
  createBotCommand,
  type CommandHandler,
} from "@/bot/commands/shared/command";

const versionPromise = readPackage().then(({ version }) => version);

export async function createVersionCommands() {
  const versionCommand: CommandHandler = async (params, { reply }) => {
    const version = await versionPromise;
    const ref = process.env.CHATBOT_REF_SHA
      ? `- ${process.env.CHATBOT_REF_SHA.slice(0, 7)}`
      : "(no ref)";

    reply(`AlveusGG Bot v${version} ${ref}`);
  };

  return [
    createBotCommand("ggv", versionCommand),
    createBotCommand("ggversion", versionCommand),
  ];
}
