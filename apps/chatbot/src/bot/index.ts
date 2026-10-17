import { Bot } from "@twurple/easy-bot";

import { env } from "@/env";
import { getAuthProvider } from "@/twitch/auth";
import { createPresetCommands } from "@/bot/commands/presets";
import { createNotificationCommands } from "@/bot/commands/notification";
import { createVersionCommands } from "@/bot/commands/version";

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
        createPresetCommands({
          keyFile: env.PRESETS_SITE_KEY_FILE,
          apiBaseUrl: env.API_BASE_URL,
        }),
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
