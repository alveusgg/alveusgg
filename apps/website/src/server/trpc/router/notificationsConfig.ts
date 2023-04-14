import { getNotificationsConfig } from "@/config/notifications";
import { publicProcedure, router } from "../trpc";

export const notificationsConfigRouter = router({
  getConfiguration: publicProcedure.query(getNotificationsConfig),
});
