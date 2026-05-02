import { prisma } from "@alveusgg/database";

export async function saveTwitchCharityCampaign(input: {
  id: string;
  broadcasterUserId: string;
  accountId?: string;
}) {
  return prisma.twitchCharityCampaign.upsert({
    where: { id: input.id },
    create: input,
    update: {
      broadcasterUserId: input.broadcasterUserId,
      accountId: input.accountId,
    },
  });
}
