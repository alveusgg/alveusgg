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
