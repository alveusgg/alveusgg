import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { getTransparentNavAnchorId } from "@/data/site-header-hero";

const NEAR_TOP_PX = 16;
const SCROLL_DOWN_THRESHOLD = 10;
const SCROLL_UP_THRESHOLD = 8;

const SITE_HEADER_INSET_VAR = "--site-header-sticky-inset";

type UseSiteHeaderOptions = {
  enabled: boolean;
  pathname: string;
  /** When false, header stays visible (no hide-on-scroll-down). */
  autoHideEnabled?: boolean;
  mobileMenuOpen: boolean;
  headerElement: HTMLElement | null;
  /** Reset header to visible when this changes (e.g. route). */
  resetKey: string;
};

export function useSiteHeader({
  enabled,
  pathname,
  autoHideEnabled = true,
  mobileMenuOpen,
  headerElement,
  resetKey,
}: UseSiteHeaderOptions) {
  const heroAnchorId = useMemo(
    () => (enabled ? getTransparentNavAnchorId(pathname) : undefined),
    [enabled, pathname],
  );

  const [solidChrome, setSolidChrome] = useState(() => heroAnchorId == null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const mobileOpenRef = useRef(mobileMenuOpen);
  const enabledRef = useRef(enabled);
  const autoHideRef = useRef(autoHideEnabled);

  useEffect(() => {
    mobileOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    autoHideRef.current = autoHideEnabled;
  }, [autoHideEnabled]);

  useEffect(() => {
    if (enabled && !autoHideEnabled) {
      setHeaderVisible(true);
    }
  }, [enabled, autoHideEnabled]);

  useEffect(() => {
    setHeaderVisible(true);
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || heroAnchorId == null) {
      setSolidChrome(true);
      return;
    }

    const measure = () => {
      const el = document.getElementById(heroAnchorId);
      if (!el) {
        setSolidChrome(false);
        return;
      }
      setSolidChrome(el.getBoundingClientRect().top <= 0);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const el = document.getElementById(heroAnchorId);
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
  }, [enabled, heroAnchorId, resetKey]);

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

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty(SITE_HEADER_INSET_VAR);
      return () => {
        document.documentElement.style.removeProperty(SITE_HEADER_INSET_VAR);
      };
    }

    const insetPx =
      headerVisible || mobileMenuOpen ? `${headerHeight}px` : "0px";
    document.documentElement.style.setProperty(SITE_HEADER_INSET_VAR, insetPx);

    return () => {
      document.documentElement.style.removeProperty(SITE_HEADER_INSET_VAR);
    };
  }, [enabled, headerVisible, mobileMenuOpen, headerHeight]);

  useEffect(() => {
    if (!enabled) {
      lastScrollY.current =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      return;
    }

    const onScroll = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        if (!enabledRef.current) return;

        const y =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;

        if (mobileOpenRef.current || y < NEAR_TOP_PX || !autoHideRef.current) {
          setHeaderVisible(true);
          lastScrollY.current = y;
          return;
        }

        const delta = y - lastScrollY.current;
        if (delta > SCROLL_DOWN_THRESHOLD) {
          setHeaderVisible(false);
        } else if (delta < -SCROLL_UP_THRESHOLD) {
          setHeaderVisible(true);
        }
        lastScrollY.current = y;
      });
    };

    lastScrollY.current =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [enabled, autoHideEnabled]);

  return { headerVisible, headerHeight, solidChrome };
}
