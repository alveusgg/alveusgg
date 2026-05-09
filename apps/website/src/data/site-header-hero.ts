/**
 * Routes where the fixed header stays transparent over a full-width hero until
 * the user scrolls past the element with the given `id` (home: "What is Alveus?",
 * institute: first post-hero section).
 */
export const TRANSPARENT_NAV_UNTIL_ANCHOR: Readonly<Record<string, string>> = {
  "/": "alveus",
  "/institute": "pixels",
};

export function getTransparentNavAnchorId(
  pathname: string,
): string | undefined {
  return TRANSPARENT_NAV_UNTIL_ANCHOR[pathname];
}
