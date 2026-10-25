import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  disconnectAccount,
  getConnectedAccounts,
} from "@/server/auth/accounts";
import {
  ACCOUNT_LINK_COOKIE,
  ACCOUNT_LINK_MAX_AGE,
  RECENT_AUTH_COOKIE,
  WEBSITE_SESSION_COOKIE,
  createAuthAction,
  isSameOrigin,
  setAuthActionCookie,
  verifyAuthAction,
} from "@/server/auth/actions";
import { enabledLoginProviders } from "@/server/auth/providers";
import {
  OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_FIRST_PARTY_CLIENT_ID,
  OAUTH_TOKEN_TYPE,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";
import { issueAccessTokenForUser } from "@/server/oauth/tokens";

import { isLoginProvider } from "@/data/auth";

import { protectedProcedure, publicProcedure, router } from "../trpc";

const accountActionProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isSameOrigin(ctx.req))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Account changes must start on this website.",
    });
  if (
    !(await verifyAuthAction(
      ctx.req.cookies[RECENT_AUTH_COOKIE],
      "recent-auth",
      ctx.session.user.id,
    ))
  ) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Confirm your identity with a connected login method first.",
    });
  }
  return next({ ctx });
});

export const authRouter = router({
  getAccountConnections: protectedProcedure.query(async ({ ctx }) => ({
    accounts: await getConnectedAccounts(ctx.session.user.id),
    providers: enabledLoginProviders,
    recentlyAuthenticated: await verifyAuthAction(
      ctx.req.cookies[RECENT_AUTH_COOKIE],
      "recent-auth",
      ctx.session.user.id,
    ),
  })),
  beginAccountLink: accountActionProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        !isLoginProvider(input.provider) ||
        !enabledLoginProviders.includes(input.provider)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This login provider is not available.",
        });
      }
      const existing = await ctx.prisma.account.findFirst({
        where: { userId: ctx.session.user.id, provider: input.provider },
        select: { id: true },
      });
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This provider is already connected. Reconnect the existing account instead.",
        });
      setAuthActionCookie(
        ctx.res,
        ACCOUNT_LINK_COOKIE,
        await createAuthAction(
          "account-link",
          ctx.session.user.id,
          input.provider,
        ),
        ACCOUNT_LINK_MAX_AGE,
      );
    }),
  disconnectAccount: accountActionProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input }) => {
      await disconnectAccount(
        ctx.session.user.id,
        input,
        enabledLoginProviders,
        ctx.req.cookies[WEBSITE_SESSION_COOKIE],
      );
    }),
  updateDisplayName: accountActionProcedure
    .input(z.string().trim().min(1).max(100))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input },
        select: { id: true },
      });
    }),
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  mintOAuthAccessToken: protectedProcedure.mutation(async ({ ctx }) => {
    if (!hasOAuthSigningKey()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "OAuth signing key is not configured.",
      });
    }

    try {
      const accessToken = await issueAccessTokenForUser({
        userId: ctx.session.user.id,
        clientId: OAUTH_FIRST_PARTY_CLIENT_ID,
      });

      return {
        accessToken,
        tokenType: OAUTH_TOKEN_TYPE,
        expiresIn: OAUTH_ACCESS_TOKEN_TTL_SECONDS,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "OAuth token minting failed.",
        cause: error,
      });
    }
  }),
});
