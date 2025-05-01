import type { LinkProps } from "next/link";
import { useRouter } from "next/router";

const useIsActivePath = (href: LinkProps["href"], exact = false) => {
  const router = useRouter();

  const url = typeof href === "string" ? href : href.href;
  if (!url) return false;

  const currentRoute = router.pathname.replace(/\/?$/, "/"); // always end with a slash and remove query string
  if (url.startsWith("#") || currentRoute === url) return true;

  if (exact || url === "/" || !url.startsWith("/")) return false;

  return currentRoute.startsWith(url.replace(/\/?$/, "/"));
};

export default useIsActivePath;
