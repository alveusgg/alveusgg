import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";
import { prisma } from "@/server/db/client";

import {
  deleteTicket,
  getTicket,
  saveTicket,
} from "@/server/db/virtual-tickets";
import { virtualTicketSchema } from "@/server/utils/virtual-tickets";
import { getVirtualTicketImageUrl } from "@/utils/virtual-tickets";

function revalidateTicket(eventId: string, userName: string) {
  revalidatePath(getVirtualTicketImageUrl(eventId, userName, "og"));
  revalidatePath(getVirtualTicketImageUrl(eventId, userName, "ticket"));
}

export const virtualTicketsRouter = router({
  getTicket: publicProcedure
    .input(
      z.object({
        userName: z.string(),
        eventId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findFirst({
        select: { id: true },
        where: { name: input.userName },
      });
      if (!user) {
        // NOTE: We use the same error, so we don't leak if a user exists or not
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const ticket = await getTicket(input.eventId, user.id);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      return ticket;
    }),

  getMyTicket: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ticket = await getTicket(input.eventId, ctx.session.user.id);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      return ticket;
    }),

  save: protectedProcedure
    .input(virtualTicketSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      await saveTicket({
        ...input,
        userId: ctx.session.user.id,
      });

      if (ctx.session.user.name) {
        revalidateTicket(input.eventId, ctx.session.user.name);
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await getTicket(input.eventId, ctx.session.user.id);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await deleteTicket(ctx.session.user.id);

      if (ctx.session.user.name) {
        revalidateTicket(input.eventId, ctx.session.user.name);
      }
    }),
});
