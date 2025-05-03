import { prisma } from "@alveusgg/database";

export async function markPushSubscriptionAsDeleted(id: string) {
  return prisma.pushSubscription.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
