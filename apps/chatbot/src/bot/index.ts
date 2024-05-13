import { Bot } from "@twurple/easy-bot";

import { createNotificationCommands } from "@/bot/commands/notification";
import { createVersionCommands } from "@/bot/commands/version";
import { env } from "@/env";
import { getAuthProvider } from "@/twitch/auth";

export async function startBot() {
  const authProvider = await getAuthProvider();

  const bot = new Bot({
    authProvider,
    channels: env.BOT_CHANNEL_NAMES,
    commands: (
      await Promise.all([
        // Notification commands
        createNotificationCommands(),
        createVersionCommands(),
      ])
    ).flat(),
    chatClientOptions: {
      logger: {
        minLevel: env.BOT_LOGLEVEL,
      },
    },
  });

  bot.onJoin(async (e) => {
    console.log(`Joined ${e.broadcasterName}`);
  });

  bot.onConnect(async () => {
    console.log("Connected");
  });

  bot.onAuthenticationFailure(async () => {
    console.log("Authentication failure");
  });

  bot.onAuthenticationSuccess(async () => {
    console.log("Authentication success");
  });

  bot.onDisconnect(async () => {
    console.log("Disconnected");
  });

  //bot.onWhisper(async (message) => {
  //  console.log(message.userName, message.text, message.userId);
  //});

  //bot.onMessage(async (message) => {
  //  console.log(message.userName, message.text, message.userId);
  //});
}
