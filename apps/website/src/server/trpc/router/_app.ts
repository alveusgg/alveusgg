import { router } from "../trpc";
import { authRouter } from "./auth";
import { adminActionRouter } from "./admin/actions";
import { pushSubscriptionRouter } from "./push/subscription";
import { notificationsConfigRouter } from "./notificationsConfig";
import { rafflesRouter } from "./raffles";
import { adminRafflesRouter } from "./admin/raffles";

export const appRouter = router({
  auth: authRouter,
  adminAction: adminActionRouter,
  adminRaffles: adminRafflesRouter,
  pushSubscription: pushSubscriptionRouter,
  notificationsConfig: notificationsConfigRouter,
  raffles: rafflesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
