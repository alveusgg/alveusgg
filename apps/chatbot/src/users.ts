import { env } from "@/env";
import { getUserRoles } from "@/db/users";

type UserRoleCacheEntry = {
  roles: string[];
  expiresAt: number;
  isRefreshing: boolean;
};

const notificationsUserRole = "notifications";

export async function checkUserIsAllowedToSendNotifications(userName: string) {
  userName = userName.toLowerCase();

  if (env.MODERATOR_USER_NAMES.includes(userName)) {
    return true;
  }

  const useRoles = await getRolesForUser(userName);
  return useRoles.includes(notificationsUserRole);
}

const userRoleCache = new Map<string, UserRoleCacheEntry>();
async function getRolesForUser(userName: string) {
  if (userRoleCache.has(userName)) {
    const cacheEntry = userRoleCache.get(userName);
    if (cacheEntry) {
      // if the cached entry is stale, refresh entry, update cache, return stale roles immediately
      if (cacheEntry.expiresAt <= Date.now()) {
        cacheEntry.isRefreshing = true;
        getNewUserRoleEntry(userName).then((newEntry: UserRoleCacheEntry) => {
          userRoleCache.set(userName, newEntry);
        });
      }

      return cacheEntry.roles;
    }
  }

  // if no cache entry, refresh entry, update cache, return roles
  const entry = await getNewUserRoleEntry(userName);
  userRoleCache.set(userName, entry);
  return entry.roles;
}

async function getNewUserRoleEntry(
  userName: string,
): Promise<UserRoleCacheEntry> {
  const roles = await getUserRoles(userName);
  const expiresAt = Date.now() + 60_000;
  return {
    roles,
    expiresAt,
    isRefreshing: false,
  };
}
