import type {
  ImageConfigComplete,
  ImageLoaderProps,
} from "next/dist/shared/lib/image-config";
import defaultLoader from "next/dist/shared/lib/image-loader";
import type { ImageProps } from "next/image";

// Based on https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L23-L25
// and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L743-L748
// and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L191-L193
const imageConfig = process.env
  .__NEXT_IMAGE_OPTS as unknown as ImageConfigComplete;

const imageWidths = [
  ...imageConfig.deviceSizes,
  ...imageConfig.imageSizes,
].sort((a, b) => a - b);

export type { ImageLoaderProps };

export function createImageUrl(props: ImageLoaderProps) {
  const resolvedWidth =
    imageWidths.find((w) => w >= props.width) ||
    imageWidths[imageWidths.length - 1]!;

  return defaultLoader({
    ...props,
    config: imageConfig,
    width: resolvedWidth,
  });
}

export function getImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") {
    return src;
  }

  return "default" in src ? src.default.src : src.src;
}
