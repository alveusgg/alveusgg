import { prisma } from "@alveusgg/database";

export async function getRolesForUser(userId: string) {
  return (
    await prisma.userRole.findMany({
      select: { role: true },
      where: { user: { id: userId } },
    })
  ).map(({ role }) => role);
}
