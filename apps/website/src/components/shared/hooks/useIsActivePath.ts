import type { UrlObject } from "url";
import { useRouter } from "next/router";

export function useIsActivePath(href: UrlObject | string) {
  const router = useRouter();
  const currentRoute = router.pathname;
  const url = typeof href === "string" ? href : href.href;
  return (
    url &&
    (url.startsWith("#") ||
      (url.startsWith("/") &&
        currentRoute.replace(/\/?$/, "/").startsWith(url.replace(/\/?$/, "/"))))
  );
}
