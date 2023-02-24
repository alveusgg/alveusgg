import { prisma } from "@/server/db/client";

const cache = new Map<string, string[]>();

export async function getRolesForUser(userId: string) {
  const cachedRoles = cache.get(userId);
  if (cachedRoles) {
    return cachedRoles;
  }

  const roles = (
    await prisma.userRole.findMany({
      where: { user: { id: userId } },
    })
  ).map((role) => role.role);

  cache.set(userId, roles);

  return roles;
}
