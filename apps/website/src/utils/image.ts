import type {
  ImageConfigComplete,
  ImageLoaderProps,
} from "next/dist/shared/lib/image-config";
import defaultLoader from "next/dist/shared/lib/image-loader";

// Get our base URL, which will either be specifically set, or from Vercel for preview deployments
const BASE_URL = (
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || ""
).replace(/\/$/, "");

// Based on https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L23-L25
// and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L743-L748
// and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L191-L193
const imageConfig = process.env
  .__NEXT_IMAGE_OPTS as unknown as ImageConfigComplete;

export function getImageSizes() {
  return [...imageConfig.deviceSizes, ...imageConfig.imageSizes];
}

export function createImageUrl(props: ImageLoaderProps) {
  return (
    BASE_URL +
    defaultLoader({
      config: imageConfig,
      ...props,
    })
  );
}
