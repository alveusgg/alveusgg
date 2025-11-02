import { useLayoutEffect } from "react";

const DEFAULT_SCROLL_THRESHOLD = 50; // px from top considered "at top"

export function usePrependScrollLock(
  watchValue: unknown,
  threshold = DEFAULT_SCROLL_THRESHOLD,
) {
  useLayoutEffect(() => {
    // Determine which element is used for scrolling
    const el =
      document.scrollingElement || document.documentElement || document.body;

    const oldTop = el.scrollTop;
    if (oldTop < threshold) return; // skip if near top

    const oldHeight = el.scrollHeight;

    // Wait for DOM mutations to update
    const id = requestAnimationFrame(() => {
      const newHeight = el.scrollHeight;
      const diff = newHeight - oldHeight;

      // Adjust the scrollTop to compensate if the user is *not at top*
      el.scrollTop = oldTop + diff;
    });
    return () => cancelAnimationFrame(id);
  }, [watchValue, threshold]);
}
