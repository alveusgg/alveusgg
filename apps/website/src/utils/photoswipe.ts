import type { PhotoSwipeOptions } from "photoswipe";

export function getDefaultPhotoswipeLightboxOptions() {
  return {
    pswpModule: () => import("photoswipe"),
    appendToEl: document.getElementById("app") as HTMLElement,
    showHideAnimationType: "fade",
    loop: false,
  } as const satisfies PhotoSwipeOptions;
}
