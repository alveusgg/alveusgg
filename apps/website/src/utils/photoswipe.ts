import type { PhotoSwipeOptions } from "photoswipe";

export function getDefaultPhotoswipeLightboxOptions() {
  return {
    appendToEl: document.getElementById("app") as HTMLElement,
  } as const satisfies PhotoSwipeOptions;
}
