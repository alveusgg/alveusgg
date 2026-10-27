import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

import { probeImageMeta } from "@/server/utils/probe-image-meta";

const readImage = (file: string) =>
  readFileSync(new URL(`./fixtures/images/${file}`, import.meta.url));

it.each(["jpeg", "png", "avif", "gif", "webp"])(
  "returns the type and size from %s headers",
  (format) => {
    // GIF and WebP fixtures have two frames; dimensions describe one frame.
    expect(probeImageMeta(readImage(`image.${format}`))).toEqual({
      mimeType: `image/${format}`,
      width: 40,
      height: 30,
    });
  },
);

it("swaps width and height for rotated JPEG images", () => {
  expect(probeImageMeta(readImage("rotated.jpeg"))).toEqual({
    mimeType: "image/jpeg",
    width: 30,
    height: 40,
  });
});

it("reads dimensions without requiring pixel data", () => {
  const png = readImage("image.png");
  expect(probeImageMeta(png.subarray(0, 24))).toEqual({
    mimeType: "image/png",
    width: 40,
    height: 30,
  });
  expect(probeImageMeta(png.subarray(0, 16))).toBe(false);
});

it.each([
  "",
  "<html></html>",
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"></svg>',
])("rejects missing or unsupported image headers: %s", (content) => {
  expect(probeImageMeta(new TextEncoder().encode(content))).toBe(false);
});
