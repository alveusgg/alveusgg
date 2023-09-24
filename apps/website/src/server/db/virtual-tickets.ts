import { z } from "zod";
import { prisma } from "@/server/db/client";

const stickerSchema = z.object({
  imageId: z.string(),
  x: z.number(),
  y: z.number(),
});

export type VirtualTicketCustomization = z.infer<
  typeof virtualTicketCustomizationSchema
>;

export const virtualTicketCustomizationSchema = z.object({
  stickers: z.array(stickerSchema),
});

export const virtualTicketSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string(),
  customization: virtualTicketCustomizationSchema,
});

export async function saveTicket({
  userId,
  eventId,
  customization: customizationData,
}: z.infer<typeof virtualTicketSchema>) {
  const customization = JSON.stringify(customizationData);

  return prisma.virtualTicket.upsert({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
    create: {
      userId,
      eventId,
      customization,
    },
    update: {
      customization,
      updatedAt: new Date(),
    },
  });
}

function deserializeCustomization(
  customizationData: string,
): VirtualTicketCustomization {
  const customization = virtualTicketCustomizationSchema.safeParse(
    JSON.parse(customizationData),
  );

  return customization.success ? customization.data : { stickers: [] };
}

export async function getTicket(eventId: string, userId: string) {
  const ticketData = await prisma.virtualTicket.findFirst({
    where: {
      eventId,
      userId,
    },
  });
  if (!ticketData) return null;

  return {
    userId: ticketData.userId,
    eventId: ticketData.eventId,
    customization: deserializeCustomization(ticketData.customization),
  };
}

export async function deleteTicket(userId: string) {
  return prisma.virtualTicket.deleteMany({
    where: {
      userId,
    },
  });
}
