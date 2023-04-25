import { adminUsersRouter } from "@/server/trpc/router/admin/users";
import { notificationsRouter } from "@/server/trpc/router/notifications";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { adminActionRouter } from "./admin/actions";
import { pushSubscriptionRouter } from "./push/subscription";
import { formsRouter } from "./forms";
import { adminFormsRouter } from "./admin/forms";
import { adminActivityFeedRouter } from "./admin/activity-feed";
import { showAndTellRouter } from "./show-and-tell";
import { adminShowAndTellRouter } from "./admin/show-and-tell";

export const appRouter = router({
  auth: authRouter,
  adminAction: adminActionRouter,
  adminForms: adminFormsRouter,
  adminActivityFeed: adminActivityFeedRouter,
  adminShowAndTell: adminShowAndTellRouter,
  adminUsersRouter: adminUsersRouter,
  notifications: notificationsRouter,
  pushSubscription: pushSubscriptionRouter,
  showAndTell: showAndTellRouter,
  forms: formsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
