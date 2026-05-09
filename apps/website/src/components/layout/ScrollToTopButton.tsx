import { useCallback, useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";

import IconChevronUp from "@/icons/IconChevronUp";

const SCROLL_SHOW_PX = 360;
const SCROLL_TO_TOP_DURATION_MS = 750;

/** Cubic ease-out; rAF scroll works when `behavior: smooth` is ignored (some browsers / OS settings). */
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const scrollAnimFrame = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY >= SCROLL_SHOW_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => () => {
      if (scrollAnimFrame.current != null) {
        cancelAnimationFrame(scrollAnimFrame.current);
      }
    },
    [],
  );

  const scrollToTop = useCallback(() => {
    if (scrollAnimFrame.current != null) {
      cancelAnimationFrame(scrollAnimFrame.current);
      scrollAnimFrame.current = null;
    }

    const el = document.scrollingElement ?? document.documentElement;
    const startY = window.scrollY || el.scrollTop;
    if (startY <= 0) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const duration = prefersReducedMotion ? 200 : SCROLL_TO_TOP_DURATION_MS;

    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const y = Math.max(0, Math.round(startY * (1 - easeOutCubic(t))));
      window.scrollTo(0, y);
      if (t < 1) {
        scrollAnimFrame.current = requestAnimationFrame(step);
      } else {
        scrollAnimFrame.current = null;
        window.scrollTo(0, 0);
      }
    };

    scrollAnimFrame.current = requestAnimationFrame(step);
  }, []);

  return (
    <button
      type="button"
      className={classes(
        "group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full border-2 border-alveus-green-900/20 bg-alveus-tan text-alveus-green-900 shadow-sm transition-all duration-300 ease-out motion-reduce:duration-150 motion-reduce:ease-linear",
        "hover:scale-105 hover:shadow-md active:scale-95 motion-reduce:hover:scale-100 motion-reduce:hover:shadow-sm motion-reduce:active:scale-100",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <IconChevronUp
        className="size-6 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        aria-hidden
      />
    </button>
  );
}
