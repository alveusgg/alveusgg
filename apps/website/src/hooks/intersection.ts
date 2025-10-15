import { useEffect, useRef } from "react";

const useIntersectionObserver = (
  handleIntersection: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = { threshold: 0.7 },
) => {
  const observerRef = useRef<IntersectionObserver>(null);
  const handlerRef = useRef(handleIntersection);

  // eslint-disable-next-line react-hooks/refs -- we're (ab)using a ref here to avoid needing to recreate the observer and re-observe elements
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
};

export default useIntersectionObserver;
