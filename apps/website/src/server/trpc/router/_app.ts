import { router } from "../trpc";
import { adminActivityFeedRouter } from "./admin/activity-feed";
import { adminBingosRouter } from "./admin/bingos";
import { adminCalendarEventsRouter } from "./admin/calendar-events";
import { adminDashboardRouter } from "./admin/dashboard";
import { adminFormsRouter } from "./admin/forms";
import { adminNotificationsRouter } from "./admin/notifications";
import { adminRoundsChecksRouter } from "./admin/rounds-checks";
import { adminShortLinksRouter } from "./admin/short-links";
import { adminShowAndTellRouter } from "./admin/show-and-tell";
import { adminTwitchRouter } from "./admin/twitch";
import { adminUsersRouter } from "./admin/users";
import { authRouter } from "./auth";
import { bingosRouter } from "./bingos";
import { calendarEventsRouter } from "./calendar-events";
import { donationsRouter } from "./donations";
import { formsRouter } from "./forms";
import { notificationsRouter } from "./notifications";
import { pushSubscriptionRouter } from "./push/subscription";
import { showAndTellRouter } from "./show-and-tell";
import { streamRouter } from "./stream";

export const appRouter = router({
  adminActivityFeed: adminActivityFeedRouter,
  adminBingos: adminBingosRouter,
  adminCalendarEvents: adminCalendarEventsRouter,
  adminDashboard: adminDashboardRouter,
  adminForms: adminFormsRouter,
  adminShortLinks: adminShortLinksRouter,
  adminNotifications: adminNotificationsRouter,
  adminShowAndTell: adminShowAndTellRouter,
  adminRoundsChecks: adminRoundsChecksRouter,
  adminTwitch: adminTwitchRouter,
  adminUsersRouter: adminUsersRouter,
  donations: donationsRouter,
  auth: authRouter,
  bingos: bingosRouter,
  calendarEvents: calendarEventsRouter,
  forms: formsRouter,
  notifications: notificationsRouter,
  pushSubscription: pushSubscriptionRouter,
  showAndTell: showAndTellRouter,
  stream: streamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
