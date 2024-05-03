import type { z } from "zod";

import { prisma } from "@/server/db/client";
import {
  deserializeVirtualTicketCustomization,
  type virtualTicketSchema,
} from "@/server/utils/virtual-tickets";

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
    customization: deserializeVirtualTicketCustomization(
      ticketData.customization,
    ),
  };
}

export async function deleteTicket(userId: string) {
  return prisma.virtualTicket.deleteMany({
    where: {
      userId,
    },
  });
}
