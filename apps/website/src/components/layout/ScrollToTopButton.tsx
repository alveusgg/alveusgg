import { useCallback, useEffect, useState } from "react";

import { classes } from "@/utils/classes";

import IconChevronUp from "@/icons/IconChevronUp";

const SCROLL_SHOW_PX = 360;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY >= SCROLL_SHOW_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
