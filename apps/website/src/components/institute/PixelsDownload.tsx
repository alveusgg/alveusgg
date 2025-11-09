import { type MouseEvent, useCallback } from "react";

import { PIXEL_GRID_HEIGHT, PIXEL_GRID_WIDTH } from "@/data/murals";

import { type Pixel, usePixels } from "@/hooks/pixels";

import IconDownload from "@/icons/IconDownload";

import Link from "../content/Link";
import { renderPixelPreview } from "./PixelPreview";

const PIXEL_PPI = 300;
const PIXEL_INCHES = 1.5;
const PIXEL_SIZE = PIXEL_PPI * PIXEL_INCHES;

function checkSize(width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Offscreen canvas context is not found");

  try {
    ctx.putImageData(new ImageData(1, 1), 0, 0);
    return true;
  } catch {
    return false;
  }
}

function renderPixels(pixels?: Pixel[]) {
  let chunks = 1;
  while (
    !checkSize(
      (PIXEL_SIZE * PIXEL_GRID_WIDTH) / chunks,
      PIXEL_SIZE * PIXEL_GRID_HEIGHT,
    )
  ) {
    if (chunks > PIXEL_GRID_WIDTH) {
      throw new Error("Canvas size too large to render");
    }

    chunks *= 2;
  }

  const blobs: Promise<Blob>[] = [];
  for (let chunk = 0; chunk < chunks; chunk++) {
    console.log(
      `Rendering chunk ${chunk + 1} of ${chunks}`,
      `${((PIXEL_SIZE * PIXEL_GRID_WIDTH) / chunks).toLocaleString()} x ${(PIXEL_SIZE * PIXEL_GRID_HEIGHT).toLocaleString()}`,
    );
    const canvasFull = new OffscreenCanvas(
      (PIXEL_SIZE * PIXEL_GRID_WIDTH) / chunks,
      PIXEL_SIZE * PIXEL_GRID_HEIGHT,
    );

    const canvasPreview = new OffscreenCanvas(PIXEL_SIZE, PIXEL_SIZE);

    const ctxFull = canvasFull.getContext("2d");
    const ctxPreview = canvasPreview.getContext("2d");

    if (!ctxFull || !ctxPreview) {
      throw new Error("Offscreen canvas context is not found");
    }

    for (let row = 0; row < PIXEL_GRID_HEIGHT; row++) {
      for (let column = 0; column < PIXEL_GRID_WIDTH / chunks; column++) {
        ctxPreview.clearRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
        renderPixelPreview(
          ctxPreview,
          { x: column + chunk * (PIXEL_GRID_WIDTH / chunks), y: row },
          pixels,
        );
        ctxFull.drawImage(
          canvasPreview,
          0,
          0,
          canvasPreview.width,
          canvasPreview.height,
          column * PIXEL_SIZE,
          row * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE,
        );
      }
    }

    blobs.push(canvasFull.convertToBlob({ type: "image/png" }));
  }

  return blobs;
}

function PixelsDownload() {
  const pixels = usePixels();

  const download = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const blobs = renderPixels(pixels);
      Promise.all(blobs).then((blobParts) => {
        blobParts.forEach((blob, index) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `alveus-mural-part-${index + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });
    },
    [pixels],
  );

  return (
    <Link
      href="#"
      onClick={download}
      dark
      className="mt-4 inline-flex items-center gap-2"
    >
      <IconDownload className="size-4" />
      Download full mural
    </Link>
  );
}

export default PixelsDownload;
