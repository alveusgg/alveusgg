import type { BotCommandContext } from "@twurple/easy-bot";

export { createBotCommand } from "@twurple/easy-bot";

export type CommandHandler = (
  params: string[],
  context: BotCommandContext,
) => void;
