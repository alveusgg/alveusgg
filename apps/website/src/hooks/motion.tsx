import { useEffect, useState } from "react";

const usePrefersReducedMotion = () => {
  // Default to animations disabled until we know the user's preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-reduced-motion)");

    // Get the initial preference
    setPrefersReducedMotion(mediaQueryList.matches);

    // Create an event listener to update the preference
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);

  return prefersReducedMotion;
};

export default usePrefersReducedMotion;
