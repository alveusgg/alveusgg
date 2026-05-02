import { TRPCError } from "@trpc/server";

import { env } from "@/env";

import { getActiveCharityCampaign } from "@/server/apis/twitch";
import { saveTwitchCharityCampaign } from "@/server/db/twitch-charity-campaigns";

import { protectedProcedure, router } from "../trpc";

async function pingWorkerToResubscribeTwitchCharity() {
  const managerUrl = env.NEXT_PUBLIC_DONATIONS_MANAGER_URL;
  const sharedKey = env.TRPC_API_SHARED_KEY[0];

  if (!managerUrl || !sharedKey) {
    console.warn(
      "Skipping Twitch charity resubscribe because donations manager configuration is missing.",
    );
    return;
  }

  const response = await fetch(`${managerUrl}/donations/resubscribe`, {
    method: "POST",
    headers: {
      Authorization: `ApiKey ${sharedKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to resubscribe Twitch charity webhooks: ${response.status} ${response.statusText}`,
    );
  }
}

export const twitchCharityRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.prisma.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "twitch",
      },
      select: {
        id: true,
        providerAccountId: true,
        scope: true,
      },
    });

    if (!account) {
      return {
        status: "missing_account" as const,
      };
    }

    const scopes = account.scope?.split(" ") ?? [];
    if (!scopes.includes("channel:read:charity")) {
      return {
        status: "missing_scope" as const,
        scopes,
      };
    }

    const campaigns = await ctx.prisma.twitchCharityCampaign.findMany({
      where: {
        OR: [
          { accountId: account.id },
          { broadcasterUserId: account.providerAccountId },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!campaigns.length) {
      return {
        status: "ready_to_connect" as const,
        broadcasterUserId: account.providerAccountId,
        scopes,
      };
    }

    return {
      status: "connected" as const,
      broadcasterUserId: account.providerAccountId,
      campaigns,
      scopes,
    };
  }),

  connectActiveCampaign: protectedProcedure.mutation(async ({ ctx }) => {
    const account = await ctx.prisma.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "twitch",
      },
      select: {
        id: true,
        access_token: true,
        providerAccountId: true,
        scope: true,
      },
    });

    if (!account?.access_token || !account.providerAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Twitch account missing.",
      });
    }

    const scopes = new Set(account.scope?.split(" ") ?? []);
    if (!scopes.has("channel:read:charity")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Missing channel:read:charity scope.",
      });
    }

    const campaign = await getActiveCharityCampaign(
      account.access_token,
      account.providerAccountId,
    );

    if (!campaign) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No active Twitch charity campaign found for ${env.TWITCH_CHARITY_NAME}. Start it in Twitch, then try again.`,
      });
    }

    if (campaign.broadcaster_id !== account.providerAccountId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Returned campaign does not belong to the authenticated broadcaster.",
      });
    }

    if (campaign.charity_name !== env.TWITCH_CHARITY_NAME) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Only ${env.TWITCH_CHARITY_NAME} charity campaigns are supported.`,
      });
    }

    const savedCampaign = await saveTwitchCharityCampaign({
      id: campaign.id,
      broadcasterUserId: campaign.broadcaster_id,
      accountId: account.id,
    });

    try {
      await pingWorkerToResubscribeTwitchCharity();
    } catch (error) {
      console.warn(
        "Connected Twitch charity campaign, but failed to resubscribe worker.",
        error,
      );
    }

    return savedCampaign;
  }),
});
