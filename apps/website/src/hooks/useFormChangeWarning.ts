import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFormChangeWarning(enabled: boolean = true) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  // Reset unsaved changes flag
  const resetChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Mark form as changed
  const markAsChanged = useCallback(() => {
    if (enabled) {
      setHasUnsavedChanges(true);
    }
  }, [enabled]);

  // Handle browser navigation (close tab, refresh, back button)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages and show their own
        // But setting returnValue is still required for the dialog to appear
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, enabled]);

  // Handle Next.js route changes
  useEffect(() => {
    if (!enabled) return;

    const handleRouteChangeStart = (_url: string) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?",
        );

        if (!confirmLeave) {
          router.events.emit("routeChangeError");
          // Throw an error to abort the route change
          throw "Route change aborted by user";
        }
      }
      isNavigatingRef.current = true;
    };

    const handleRouteChangeComplete = () => {
      isNavigatingRef.current = false;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [hasUnsavedChanges, router.events, enabled]);

  // Function to confirm action if there are unsaved changes
  const confirmIfUnsaved = useCallback(
    (message?: string): boolean => {
      if (!enabled || !hasUnsavedChanges) return true;

      return window.confirm(
        message ||
          "You have unsaved changes. Are you sure you want to proceed?",
      );
    },
    [hasUnsavedChanges, enabled],
  );

  return {
    hasUnsavedChanges,
    markAsChanged,
    resetChanges,
    confirmIfUnsaved,
  };
}
