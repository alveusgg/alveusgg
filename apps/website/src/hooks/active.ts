import type { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { mainNavStructure } from "@/data/navigation";

export const useActivePath = (href: LinkProps["href"], exact = false) => {
  const router = useRouter();

  const url = typeof href === "string" ? href : href.href;
  if (!url) return false;

  const currentRoute = router.pathname.replace(/\/?$/, "/"); // always end with a slash and remove query string
  if (url.startsWith("#") || currentRoute === url) return true;

  if (exact || url === "/" || !url.startsWith("/")) return false;

  return currentRoute.startsWith(url.replace(/\/?$/, "/"));
};

const flatNavStructure = Object.values(mainNavStructure)
  .flatMap((item) => ("dropdown" in item ? Object.values(item.dropdown) : item))
  .map((item) => item.link);

export const useActiveNav = () => {
  const { pathname } = useRouter();

  // Find the path with the most matching segments in the nav structure
  return useMemo(
    () =>
      flatNavStructure.reduce(
        ({ path, segments }, link) => {
          const linkSegments = link.split("/").filter(Boolean);
          const pathSegments = pathname.split("/").filter(Boolean);

          const invalidSegment = linkSegments.findIndex(
            (seg, i) => seg !== pathSegments[i],
          );
          const matchSegments =
            invalidSegment === -1 ? linkSegments.length : invalidSegment;

          if (matchSegments > segments) {
            return { path: link, segments: matchSegments };
          }
          return { path, segments };
        },
        { path: "/", segments: 0 },
      ).path,
    [pathname],
  );
};
