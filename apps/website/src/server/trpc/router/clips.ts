import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc/trpc";
import { env } from "@/env";

import {
  addClip,
  addVote,
  clipSubmitInputSchema,
  getClips,
  removeVote,
} from "@/server/db/clips";
import { getClipDetails } from "@/server/utils/twitch-api";

export type SortOptions = "new" | "top" | "top_7day" | "top_30day";

const clipsPerPage = 12;

export const clipsRouter = router({
  addClip: publicProcedure
    .input(clipSubmitInputSchema)
    .mutation(async ({ ctx, input }) => {
      // https://clips.twitch.tv/slug?query
      // https://www.twitch.tv/channel/clip/slug?query
      // https://www.twitch.tv/clip/slug?query
      // https://m.twitch.tv/channel/clip/slug?query

      const clipRegex =
        /^https?:.+(?:clips\.twitch\.tv|(?:m\.)?twitch\.tv\/(?:clip|.+\/clip))\/?([\w-]+)/;
      const slug = input.url.match(clipRegex)?.[1];

      if (!slug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clip URL is invalid",
        });
      }

      const userId = ctx.session?.user?.id;

      const details = await getClipDetails(slug);
      const clipDetails = details?.data?.[0];

      if (!clipDetails) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clip not found",
        });
      }

      const channelAllowlist = env.CLIPS_CHANNEL_ALLOWLIST || [];
      const channelAllowed = channelAllowlist.some(
        (c: string) =>
          c.toLowerCase() === clipDetails.broadcaster_name.toLowerCase(),
      );

      if (!channelAllowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Clip must be from one of the following channels: " +
            channelAllowlist.join(", "),
        });
      }

      await addClip(
        {
          slug: slug,
          title: input.title || clipDetails.title,
          thumbnailUrl: clipDetails.thumbnail_url,
          createdAt: new Date(clipDetails.created_at),
          creator: clipDetails.creator_name,
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
        filter: z.enum(["approved", "unapproved"]).default("approved"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, sortBy, filter } = input;

      const userId = ctx.session?.user?.id;

      const clips = await getClips({
        cursor: cursor || undefined,
        sortBy,
        limit: clipsPerPage + 1,
        userId,
        filter,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (clips.length > clipsPerPage) {
        const nextClip = clips.pop();
        nextCursor = nextClip?.id || undefined;
      }

      return { clips, nextCursor };
    }),
});
