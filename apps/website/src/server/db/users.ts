import { prisma } from "@/server/db/client";

export async function getRolesForUser(userId: string) {
  return (
    await prisma.userRole.findMany({
      select: { role: true },
      where: { user: { id: userId } },
    })
  ).map(({ role }) => role);
}
