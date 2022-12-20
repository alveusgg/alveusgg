import { router } from "../trpc";
import { authRouter } from "./auth";
import { adminActionRouter } from "./admin/actions";

export const appRouter = router({
  auth: authRouter,
  adminAction: adminActionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
