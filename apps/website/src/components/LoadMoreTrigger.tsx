import { useCallback } from "react";

import useIntersectionObserver from "@/hooks/intersection";

const intersectionSettings = {
  threshold: 1.0,
  rootMargin: "200px",
};

export function LoadMoreTrigger({ onLoadMore }: { onLoadMore: () => void }) {
  const registerObserveElement = useIntersectionObserver(
    useCallback(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[0];
        if (entry?.target instanceof HTMLElement && entry.isIntersecting) {
          onLoadMore();
        }
      },
      [onLoadMore],
    ),
    intersectionSettings,
  );

  return <div ref={registerObserveElement} style={{ height: "1px" }} />;
}
