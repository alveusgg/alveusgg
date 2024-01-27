import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc/trpc";

import {
  addClip,
  addVote,
  clipSubmitInputSchema,
  getClips,
  removeVote,
} from "@/server/db/clips";
import { getClipDetails } from "@/server/utils/twitch-api";

export type SortOptions = "new" | "top" | "top_7day" | "top_30day";

export const clipsRouter = router({
  addClip: publicProcedure
    .input(clipSubmitInputSchema)
    .mutation(async ({ ctx, input }) => {
      // https://clips.twitch.tv/slug?query
      // https://www.twitch.tv/channel/clip/slug?query
      // https://www.twitch.tv/clip/slug?query
      // https://m.twitch.tv/channel/clip/slug?query

      const clipRegex =
        /^https?:.+(?:clips\.twitch\.tv|(?:m\.)?twitch\.tv\/(?:clip|.+\/clip))\/?([\w\d-]+)/;
      const slug = input.url.match(clipRegex)?.[1];

      if (!slug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clip URL is invalid",
        });
      }

      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not logged in",
        });
      }

      const details = await getClipDetails(slug);
      const clipDetails = details?.data?.[0];

      if (!clipDetails) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clip not found",
        });
      }

      const channelAllowlist = ["alveussanctuary", "maya"];

      if (
        !channelAllowlist.includes(clipDetails.broadcaster_name.toLowerCase())
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clip not from AlveusSanctuary or Maya",
        });
      }

      await addClip(
        {
          clipSlug: slug,
          title: input.title || clipDetails.title,
          thumbnail: clipDetails.thumbnail_url,
          createdAt: new Date(clipDetails.created_at),
          clipCreator: clipDetails.creator_name,
        },
        userId,
      );
    }),

  addVote: publicProcedure
    .input(
      z.object({
        clipId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not logged in",
        });
      }

      addVote(input.clipId, userId);
    }),

  removeVote: publicProcedure
    .input(
      z.object({
        clipId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not logged in",
        });
      }

      removeVote(input.clipId, userId);
    }),

  getClips: publicProcedure
    .input(
      z.object({
        cursor: z.string().cuid().nullish(),
        sortBy: z.enum(["new", "top", "top_7day", "top_30day"]).default("new"),
        filter: z.enum(["approved", "pendingApproval"]).default("approved"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, sortBy, filter } = input;

      const userId = ctx.session?.user?.id;

      const clips = await getClips({
        cursor: cursor || undefined,
        sortBy,
        limit: 10,
        userId,
        filter,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (clips.length > 10) {
        const nextClip = clips.pop();
        nextCursor = nextClip?.id || undefined;
      }

      return { clips, nextCursor };
    }),
});
