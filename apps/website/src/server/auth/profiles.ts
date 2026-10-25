/** Only call with the provider profile from a completed OAuth sign-in. */
export function getProviderAccountProfile(
  provider: string,
  profile?: {
    preferred_username?: unknown;
    username?: unknown;
    discriminator?: unknown;
    global_name?: unknown;
    name?: unknown;
  },
) {
  const text = (value: unknown) =>
    typeof value === "string" ? value.trim() || null : null;

  if (provider === "twitch") {
    return {
      username: text(profile?.preferred_username),
      displayName: null,
    };
  }
  if (provider === "discord") {
    const username = text(profile?.username);
    const discriminator = text(profile?.discriminator);
    return {
      username:
        username && discriminator && discriminator !== "0"
          ? `${username}#${discriminator}`
          : username,
      displayName: text(profile?.global_name),
    };
  }
  if (provider === "google") {
    // A Google profile name does not identify a YouTube channel or handle.
    return { username: null, displayName: text(profile?.name) };
  }
  return { username: null, displayName: null };
}

/** Email ownership is separate from provider account identity. */
export function getVerifiedProviderEmail(
  provider: string,
  profile?: {
    email?: string | null;
    email_verified?: unknown;
    verified?: unknown;
  },
) {
  if (!profile) return null;
  const verified =
    provider === "discord"
      ? profile.verified === true
      : (provider === "google" || provider === "twitch") &&
        profile.email_verified === true;
  return verified && typeof profile.email === "string" && profile.email.trim()
    ? profile.email.trim().toLowerCase()
    : null;
}
