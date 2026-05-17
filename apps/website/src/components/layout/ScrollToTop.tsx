import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { classes } from "@/utils/classes";

import IconChevronDown from "@/icons/IconChevronDown";

const SHOW_AFTER = 400;

// Pages that own their bottom-right corner (e.g. Show and Tell's
// presentation-mode floating panels) opt out of the sitewide button.
const isSuppressed = (pathname: string) =>
  pathname.startsWith("/show-and-tell");

export const ScrollToTop = () => {
  const { pathname } = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isSuppressed(pathname)) {
      setVisible(false);
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };

    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (isSuppressed(pathname)) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={classes(
        "fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-alveus-green-900 text-white shadow-lg transition-opacity duration-200 hover:bg-alveus-green-800 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-alveus-green-900 focus:outline-none motion-reduce:transition-none",
        visible ? "opacity-90" : "pointer-events-none opacity-0",
      )}
    >
      <IconChevronDown className="size-6 rotate-180" />
    </button>
  );
};
