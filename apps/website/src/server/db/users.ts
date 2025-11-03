import { prisma } from "@alveusgg/database";

export async function getRolesForUser(userId: string) {
  return (
    await prisma.userRole.findMany({
      select: { role: true },
      where: { user: { id: userId } },
    })
  ).map(({ role }) => role);
}

export async function getTwitchUserId(userId: string) {
  return (
    await prisma.account.findFirst({
      where: {
        provider: "twitch",
        userId,
      },
      select: {
        providerAccountId: true,
      },
    })
  )?.providerAccountId;
}
