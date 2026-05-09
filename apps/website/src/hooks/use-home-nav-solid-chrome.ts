import { useEffect, useState } from "react";

/** Matches the `id` on the "What is Alveus?" heading on the home page. */
const HOME_NAV_ANCHOR_ID = "alveus";

/**
 * On `/`, `true` when the viewport has scrolled to or past the "What is Alveus?" section
 * (hero / transparent nav above, solid green bar below — same as other pages).
 */
export function useHomeNavSolidChrome(isHomePage: boolean) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    if (!isHomePage) {
      setSolid(false);
      return;
    }

    const measure = () => {
      const el = document.getElementById(HOME_NAV_ANCHOR_ID);
      if (!el) {
        setSolid(false);
        return;
      }
      const top = el.getBoundingClientRect().top;
      setSolid(top <= 0);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const el = document.getElementById(HOME_NAV_ANCHOR_ID);
    const ro =
      el &&
      new ResizeObserver(() => {
        measure();
      });
    if (el && ro) ro.observe(el);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [isHomePage]);

  return solid;
}
