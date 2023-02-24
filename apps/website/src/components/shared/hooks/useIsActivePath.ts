import type { UrlObject } from "url";
import { useRouter } from "next/router";

export function useIsActivePath(href: UrlObject | string, exact = false) {
  const router = useRouter();
  const url = typeof href === "string" ? href : href.href;
  if (!url) {
    return false;
  }

  const currentRoute = router.pathname.replace(/\/?$/, "/"); // always end with a slash and remove query string
  if (url.startsWith("#") || currentRoute === url) {
    return true;
  }

  if (exact || url === "/" || !url.startsWith("/")) {
    return false;
  }

  return currentRoute.startsWith(url.replace(/\/?$/, "/"));
}
