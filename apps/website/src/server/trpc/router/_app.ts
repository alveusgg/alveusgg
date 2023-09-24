import { router } from "../trpc";

import { adminActivityFeedRouter } from "./admin/activity-feed";
import { adminBingosRouter } from "./admin/bingos";
import { adminFormsRouter } from "./admin/forms";
import { adminNotificationsRouter } from "./admin/notifications";
import { adminShowAndTellRouter } from "./admin/show-and-tell";
import { adminTwitchRouter } from "./admin/twitch";
import { adminUsersRouter } from "./admin/users";
import { authRouter } from "./auth";
import { bingosRouter } from "./bingos";
import { formsRouter } from "./forms";
import { notificationsRouter } from "./notifications";
import { pushSubscriptionRouter } from "./push/subscription";
import { showAndTellRouter } from "./show-and-tell";
import { virtualTicketsRouter } from "./virtual-tickets";

export const appRouter = router({
  adminActivityFeed: adminActivityFeedRouter,
  adminBingos: adminBingosRouter,
  adminForms: adminFormsRouter,
  adminNotifications: adminNotificationsRouter,
  adminShowAndTell: adminShowAndTellRouter,
  adminTwitch: adminTwitchRouter,
  adminUsersRouter: adminUsersRouter,
  auth: authRouter,
  bingos: bingosRouter,
  forms: formsRouter,
  notifications: notificationsRouter,
  pushSubscription: pushSubscriptionRouter,
  showAndTell: showAndTellRouter,
  virtualTickets: virtualTicketsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
