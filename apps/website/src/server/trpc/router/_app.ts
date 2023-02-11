import { router } from "../trpc";
import { authRouter } from "./auth";
import { adminActionRouter } from "./admin/actions";
import { pushSubscriptionRouter } from "./push/subscription";
import { notificationsConfigRouter } from "./notificationsConfig";
import { giveawaysRouter } from "./giveaways";
import { adminGiveawaysRouter } from "./admin/giveaways";
import { adminActivityFeedRouter } from "./admin/activity-feed";

export const appRouter = router({
  auth: authRouter,
  adminAction: adminActionRouter,
  adminGiveaways: adminGiveawaysRouter,
  adminActivityFeed: adminActivityFeedRouter,
  pushSubscription: pushSubscriptionRouter,
  notificationsConfig: notificationsConfigRouter,
  giveaways: giveawaysRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
