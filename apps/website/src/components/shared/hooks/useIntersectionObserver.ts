import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  handleIntersection: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = { threshold: 0.7 },
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const handlerRef = useRef(handleIntersection);
  handlerRef.current = handleIntersection;

  useEffect(() => {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => handlerRef.current(entries),
        options,
      );
    }
  }, [options]);

  return (el: Element | null) => {
    if (el && observerRef.current?.observe) {
      observerRef.current.observe(el);
    }
  };
}
