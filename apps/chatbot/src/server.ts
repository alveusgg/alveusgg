import { startBot } from "@/bot";
import { env } from "@/env";

(async () => {
  console.log("Starting server");
  console.log("Bot user ID: ", env.BOT_USER_ID);
  console.log("Fixed moderator list: ", env.MODERATOR_USER_NAMES.join(", "));

  await startBot();
})();
