import sharp from "sharp";
import { expect, it } from "vitest";

import { inspectImage } from "@/server/utils/inspect-image";

const createImage = (
  format: "jpeg" | "png" | "avif",
  { width = 40, height = 30 } = {},
) =>
  sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 100, b: 50 },
    },
  })
    .toFormat(format)
    .toBuffer();

it("returns the type and size of valid images", async () => {
  expect(await inspectImage(await createImage("jpeg"))).toEqual({
    mimeType: "image/jpeg",
    width: 40,
    height: 30,
  });
  expect(await inspectImage(await createImage("avif"))).toMatchObject({
    mimeType: "image/avif",
  });
});

it("swaps width and height of rotated images", async () => {
  const rotated = await sharp(await createImage("jpeg"))
    .withMetadata({ orientation: 6 })
    .toBuffer();
  expect(await inspectImage(rotated)).toMatchObject({ width: 30, height: 40 });
});

it("limits decoded pixels even for small compressed images", async () => {
  expect(
    await inspectImage(await createImage("png", { width: 2048, height: 2048 })),
  ).toEqual({ mimeType: "image/png", width: 2048, height: 2048 });

  const oversized = await createImage("png", { width: 2049, height: 2048 });
  expect(oversized.length).toBeLessThan(100_000);
  expect(await inspectImage(oversized)).toBe(false);
});

it("rejects files that aren't images", async () => {
  expect(await inspectImage(new TextEncoder().encode("<html></html>"))).toBe(
    false,
  );
});

it("rejects images that only have a valid header", async () => {
  const png = await createImage("png");
  expect(await inspectImage(png.subarray(0, 40))).toBe(false);
  expect(await inspectImage(png.subarray(0, png.length - 20))).toBe(false);
});
