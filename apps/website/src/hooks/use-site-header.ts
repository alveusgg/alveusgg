import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SITE_HEADER_INSET_VAR = "--site-header-sticky-inset";
const SUBNAV_SELECTOR = "[data-site-subnav]";

type UseSiteHeaderOptions = {
  enabled: boolean;
  mobileMenuOpen: boolean;
  headerElement: HTMLElement | null;
};

const getScrollY = () =>
  window.scrollY ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0;

/**
 * Drives the public-site header chrome:
 * - `headerVisible` flips false on downward scroll, true on upward / at top /
 *   while the mobile menu is open / on pages that render a sticky subnav.
 * - `headerHeight` mirrors the rendered header so the layout can reserve space.
 * - `scrolled` is true once the page has moved away from the very top.
 *
 * Pages with a sticky subnav (marked `[data-site-subnav]`) opt out of
 * hide-on-scroll so the subnav doesn't visually detach from the header. The
 * current header inset is exposed as a CSS variable
 * (`--site-header-sticky-inset`) for those subnavs to consume as their `top`.
 */
export function useSiteHeader({
  enabled,
  mobileMenuOpen,
  headerElement,
}: UseSiteHeaderOptions) {
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const hasSubnavRef = useRef(false);

  useLayoutEffect(() => {
    if (!enabled || !headerElement) {
      setHeaderHeight(0);
      return;
    }

    setHeaderHeight(headerElement.offsetHeight);

    const observer = new ResizeObserver(() => {
      setHeaderHeight(headerElement.offsetHeight);
    });
    observer.observe(headerElement);
    return () => observer.disconnect();
  }, [enabled, headerElement]);

  // Track sticky-subnav presence in a ref so the scroll listener doesn't have
  // to re-subscribe each time it changes. When a subnav appears we also force
  // the header back into view so the two never visually separate.
  useLayoutEffect(() => {
    if (!enabled) {
      hasSubnavRef.current = false;
      return;
    }

    const measure = () => {
      const present = document.querySelector(SUBNAV_SELECTOR) != null;
      hasSubnavRef.current = present;
      if (present) setHeaderVisible(true);
    };

    measure();

    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty(SITE_HEADER_INSET_VAR);
      return;
    }

    const inset = headerVisible || mobileMenuOpen ? `${headerHeight}px` : "0px";
    document.documentElement.style.setProperty(SITE_HEADER_INSET_VAR, inset);
    return () => {
      document.documentElement.style.removeProperty(SITE_HEADER_INSET_VAR);
    };
  }, [enabled, headerVisible, mobileMenuOpen, headerHeight]);

  useEffect(() => {
    if (!enabled) {
      setScrolled(false);
      setHeaderVisible(true);
      lastScrollY.current = 0;
      return;
    }

    const onScroll = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;

        const y = getScrollY();
        setScrolled(y > 0);

        if (mobileMenuOpen || hasSubnavRef.current || y <= 0) {
          setHeaderVisible(true);
          lastScrollY.current = y;
          return;
        }

        const delta = y - lastScrollY.current;
        if (delta > 0) setHeaderVisible(false);
        else if (delta < 0) setHeaderVisible(true);
        lastScrollY.current = y;
      });
    };

    lastScrollY.current = getScrollY();
    setScrolled(lastScrollY.current > 0);
    setHeaderVisible(true);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [enabled, mobileMenuOpen]);

  return { headerVisible, headerHeight, scrolled };
}
