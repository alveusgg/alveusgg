import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { checkIsSuperUserSession, checkPermissions } from "@/server/utils/auth";
import { type Context } from "@/server/trpc/context";
import type { PermissionConfig } from "@/config/permissions";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createCheckPermissionMiddleware = (permission: PermissionConfig) =>
  isAuthed.unstable_pipe(async ({ ctx, next }) => {
    const hasPermissions = await checkPermissions(
      permission,
      ctx.session.user.id,
    );
    if (!hasPermissions) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({ ctx });
  });

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Reusable middleware to ensure
 * users are logged with superuser privileges
 */
const isAuthedSuperUser = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !checkIsSuperUserSession(ctx.session)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected procedure
 **/
export const superUserProcedure = t.procedure.use(isAuthedSuperUser);
