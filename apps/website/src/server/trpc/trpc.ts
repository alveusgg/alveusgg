import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import { env } from "@/env";

import { type Context } from "@/server/trpc/context";
import { checkIsSuperUserSession, checkPermissions } from "@/server/utils/auth";

import type { PermissionConfig } from "@/data/permissions";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

// Middleware to log mutations
const logMutations = t.middleware(async ({ path, type, next, ctx }) => {
  console.log(
    "Node.js version:",
    typeof process !== "undefined" && process.version,
  );

  if (type === "mutation") {
    const user = ctx.session?.user
      ? `@${ctx.session.user.name ?? "unknown"} (${ctx.session.user.id})`
      : "Unauthenticated";

    console.log(
      `[${new Date().toISOString()}] tRPC MUTATION: ${user} invoked ${path}`,
    );
  }

  return next();
});

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure.use(logMutations);

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
    const hasPermissions = checkPermissions(permission, ctx.session.user);
    if (!hasPermissions) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({ ctx });
  });

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(logMutations).use(isAuthed);

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
export const superUserProcedure = t.procedure
  .use(logMutations)
  .use(isAuthedSuperUser);

/**
 * Reusable middleware to ensure
 * the request comes with a trusted shared key
 */
const isAuthedSharedKey = t.middleware(({ ctx, next }) => {
  if (!env.TRPC_API_SHARED_KEY) {
    console.log(
      `[${new Date().toISOString()}] A shared key trpc procedure was called but the shared key is not set. Set the TRPC_API_SHARED_KEY environment variable.`,
    );
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const header = ctx.req.headers["authorization"];
  const [type, key] = header?.split(" ") ?? [];
  if (type !== "ApiKey" || !key || !env.TRPC_API_SHARED_KEY.includes(key)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

/**
 * Protected procedure
 **/
export const sharedKeyProcedure = t.procedure
  .use(logMutations)
  .use(isAuthedSharedKey);
