import { router } from "../trpc";

import { adminActivityFeedRouter } from "./admin/activity-feed";
import { adminBingosRouter } from "./admin/bingos";
import { adminCalendarEventsRouter } from "./admin/calendar-events";
import { adminFormsRouter } from "./admin/forms";
import { adminShortLinksRouter } from "./admin/short-links";
import { adminNotificationsRouter } from "./admin/notifications";
import { adminShowAndTellRouter } from "./admin/show-and-tell";
import { adminTwitchRouter } from "./admin/twitch";
import { adminUsersRouter } from "./admin/users";
import { adminClipsRouter } from "./admin/clips";
import { authRouter } from "./auth";
import { bingosRouter } from "./bingos";
import { calendarEventsRouter } from "./calendar-events";
import { formsRouter } from "./forms";
import { notificationsRouter } from "./notifications";
import { pushSubscriptionRouter } from "./push/subscription";
import { showAndTellRouter } from "./show-and-tell";
import { virtualTicketsRouter } from "./virtual-tickets";
import { clipsRouter } from "./clips";

export const appRouter = router({
  adminActivityFeed: adminActivityFeedRouter,
  adminBingos: adminBingosRouter,
  adminCalendarEvents: adminCalendarEventsRouter,
  adminForms: adminFormsRouter,
  adminShortLinks: adminShortLinksRouter,
  adminNotifications: adminNotificationsRouter,
  adminShowAndTell: adminShowAndTellRouter,
  adminTwitch: adminTwitchRouter,
  adminUsersRouter: adminUsersRouter,
  adminClips: adminClipsRouter,
  auth: authRouter,
  bingos: bingosRouter,
  calendarEvents: calendarEventsRouter,
  forms: formsRouter,
  notifications: notificationsRouter,
  pushSubscription: pushSubscriptionRouter,
  showAndTell: showAndTellRouter,
  virtualTickets: virtualTicketsRouter,
  clips: clipsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
