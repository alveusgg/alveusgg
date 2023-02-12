import { router } from "../trpc";
import { authRouter } from "./auth";
import { adminActionRouter } from "./admin/actions";
import { pushSubscriptionRouter } from "./push/subscription";
import { notificationsConfigRouter } from "./notificationsConfig";
import { giveawaysRouter } from "./giveaways";
import { adminGiveawaysRouter } from "./admin/giveaways";
import { adminActivityFeedRouter } from "./admin/activity-feed";
import { adminTwitchRouter } from "./admin/twitch";

export const appRouter = router({
  auth: authRouter,
  adminAction: adminActionRouter,
  adminActivityFeed: adminActivityFeedRouter,
  adminGiveaways: adminGiveawaysRouter,
  adminTwitch: adminTwitchRouter,
  giveaways: giveawaysRouter,
  notificationsConfig: notificationsConfigRouter,
  pushSubscription: pushSubscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
