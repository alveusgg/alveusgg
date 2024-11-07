import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createFileStorageUpload,
  deleteFileStorageObject,
} from "@/server/utils/file-storage";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";
import {
  createPost,
  deletePost,
  getPublicPostById,
  getPostWithUserById,
  getPosts,
  getVolunteeringMinutes,
  showAndTellCreateInputSchema,
  showAndTellUpdateInputSchema,
  updatePost,
  withAttachments,
  getMapFeatures,
} from "@/server/db/show-and-tell";
import { imageMimeTypes } from "@/utils/files";
import { env } from "@/env";
import { notEmpty } from "@/utils/helpers";
import { extractInfoFromMapFeatures } from "@/utils/locations";

const uploadPrefix = "show-and-tell/";

const entriesPerPage = 10;

export const showAndTellRouter = router({
  getEntry: publicProcedure
    .input(z.string().cuid())
    .query(({ input }) => getPublicPostById(input)),

  getEntries: publicProcedure
    .input(
      z.object({
        filter: z.enum(["approved", "pendingApproval"]).optional(),
        cursor: z.string().cuid().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { cursor } = input;

      const items = await getPosts({
        take: entriesPerPage + 1,
        cursor: cursor || undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > entriesPerPage) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id || undefined;
      }

      return { items, nextCursor };
    }),

  getGiveAnHourProgress: publicProcedure.query(async () => {
    const minutes = await getVolunteeringMinutes();
    return Math.round(minutes / 60);
  }),

  create: publicProcedure
    .input(showAndTellCreateInputSchema)
    .mutation(
      async ({ ctx, input }) => await createPost(input, ctx.session?.user?.id),
    ),

  update: protectedProcedure
    .input(showAndTellUpdateInputSchema)
    .mutation(
      async ({ ctx, input }) => await updatePost(input, ctx.session.user.id),
    ),

  getMyEntries: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.showAndTellEntry.findMany({
      ...withAttachments,
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ),

  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const post = await getPostWithUserById(input, ctx.session.user.id);
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await Promise.allSettled([
        deletePost(post.id, ctx.session.user.id),
        // Delete all file attachments
        ...post.attachments
          .map(({ imageAttachment }) => imageAttachment?.fileStorageObject?.id)
          .filter(notEmpty)
          .map((id) => deleteFileStorageObject(id)),
      ]);
    }),

  getMyEntry: protectedProcedure
    .input(z.string().cuid())
    .query(({ ctx, input }) =>
      ctx.prisma.showAndTellEntry.findFirst({
        ...withAttachments,
        where: {
          userId: ctx.session.user.id,
          id: input,
        },
      }),
    ),

  createFileUpload: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.enum(imageMimeTypes),
      }),
    )
    .mutation(async ({ input }) => {
      const { uploadUrl, viewUrl, fileStorageObject } =
        await createFileStorageUpload({
          fileName: input.fileName,
          fileType: input.fileType,
          prefix: uploadPrefix,
        });

      if (env.NODE_ENV === "development") {
        /*
         * To enable uploads to DO Spaces in development, we need to proxy the request
         * through the Next.js server. This is because the DO Spaces endpoint is not
         * accessible without ssl, and Next.js does not support ssl in development.
         */
        return {
          viewUrl: String(viewUrl),
          uploadUrl: `/api/file-upload${uploadUrl.pathname}${uploadUrl.search}`,
          fileStorageObjectId: fileStorageObject.id,
        };
      }

      return {
        viewUrl: String(viewUrl),
        uploadUrl: String(uploadUrl),
        fileStorageObjectId: fileStorageObject.id,
      };
    }),

  getPostsFromANewLocation: publicProcedure.query(async () => {
    const mapFeatures = await getMapFeatures();

    return extractInfoFromMapFeatures(mapFeatures).postsFromANewLocation;
  }),
});
