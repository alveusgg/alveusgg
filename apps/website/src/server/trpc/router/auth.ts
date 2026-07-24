import { TRPCError } from "@trpc/server";

import {
  OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_FIRST_PARTY_CLIENT_ID,
  OAUTH_TOKEN_TYPE,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";
import { issueAccessTokenForUser } from "@/server/oauth/tokens";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
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
