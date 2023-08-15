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
  getPostById,
  getPosts,
  showAndTellCreateInputSchema,
  showAndTellUpdateInputSchema,
  updatePost,
  withAttachments,
} from "@/server/db/show-and-tell";
import { allowedFileTypes } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { env } from "@/env/index.mjs";
import { notEmpty } from "@/utils/helpers";

const uploadPrefix = "show-and-tell/";

const entriesPerPage = 10;

export const showAndTellRouter = router({
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
      const post = await getPostById(input, ctx.session.user.id);
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
        fileType: z.enum(allowedFileTypes),
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
});
