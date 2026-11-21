import { env } from "@/env";
import { getUserRolesByTwitchId } from "@/db/users";

type UserRoleCacheEntry = {
  roles: string[];
  expiresAt: number;
  isRefreshing: boolean;
};

const notificationsUserRole = "notifications";

export async function checkUserIsAllowedToSendNotifications({
  twitchUserId,
  userName,
}: {
  twitchUserId: string;
  userName: string;
}) {
  userName = userName.toLowerCase();

  if (env.MODERATOR_USER_NAMES.includes(userName)) {
    return true;
  }

  const roles = await getRolesForUser(twitchUserId);
  return roles.includes(notificationsUserRole);
}

const userRoleCache = new Map<string, UserRoleCacheEntry>();
async function getRolesForUser(twitchUserId: string) {
  if (userRoleCache.has(twitchUserId)) {
    const cacheEntry = userRoleCache.get(twitchUserId);
    if (cacheEntry) {
      // if the cached entry is stale, refresh entry, update cache, return stale roles immediately
      if (cacheEntry.expiresAt <= Date.now()) {
        cacheEntry.isRefreshing = true;
        getNewUserRoleEntry(twitchUserId).then(
          (newEntry: UserRoleCacheEntry) => {
            userRoleCache.set(twitchUserId, newEntry);
          },
        );
      }

      return cacheEntry.roles;
    }
  }

  // if no cache entry, refresh entry, update cache, return roles
  const entry = await getNewUserRoleEntry(twitchUserId);
  userRoleCache.set(twitchUserId, entry);
  return entry.roles;
}

async function getNewUserRoleEntry(
  twitchUserId: string,
): Promise<UserRoleCacheEntry> {
  const roles = await getUserRolesByTwitchId(twitchUserId);
  const expiresAt = Date.now() + 60_000;
  return {
    roles,
    expiresAt,
    isRefreshing: false,
  };
}
