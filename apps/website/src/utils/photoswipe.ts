import type { PhotoSwipeOptions, ElementProvider } from "photoswipe";

export function getDefaultPhotoswipeLightboxOptions() {
  return {
    pswpModule: () => import("photoswipe"),
    appendToEl: document.getElementById("app") as HTMLElement,
    showHideAnimationType: "fade",
    loop: false,
  } as const satisfies PhotoSwipeOptions;
}

export function resolvePhotoswipeElementProvider(
  selector?: ElementProvider,
  parent?: HTMLElement,
) {
  if (Array.isArray(selector)) return selector;
  if (selector instanceof NodeList) return Array.from(selector);
  if (selector instanceof HTMLElement) return [selector];
  if (typeof selector === "string")
    return Array.from(
      (parent || document).querySelectorAll<HTMLElement>(selector),
    );
}
