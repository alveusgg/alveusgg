import { useEffect } from "react";

export function useOnToggleNativeFullscreen(
  toggleFullscreen: (isFullscreen: boolean) => void,
) {
  useEffect(() => {
    const handleFullscreenChange = () => {
      toggleFullscreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [toggleFullscreen]);
}
