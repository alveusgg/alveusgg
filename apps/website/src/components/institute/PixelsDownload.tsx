import { useSession } from "next-auth/react";
import { type MouseEvent, useCallback, useState } from "react";

import { PIXEL_GRID_HEIGHT, PIXEL_GRID_WIDTH } from "@/data/murals";
import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { type Pixel, usePixels } from "@/hooks/pixels";

import IconDownload from "@/icons/IconDownload";
import IconLoading from "@/icons/IconLoading";

import Link from "../content/Link";
import { renderPixelPreview } from "./PixelPreview";

const PIXEL_PPI = 300;
const PIXEL_INCHES = 1.5;
const PIXEL_SIZE = PIXEL_PPI * PIXEL_INCHES;

async function checkSize(width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Offscreen canvas context is not found");

  try {
    ctx.putImageData(new ImageData(1, 1), 0, 0);
    await canvas.convertToBlob({ type: "image/png" });
    return true;
  } catch {
    return false;
  }
}

async function getChunks() {
  const divisors: number[] = [];
  for (let i = 1; i <= PIXEL_GRID_WIDTH; i++) {
    if (PIXEL_GRID_WIDTH % i === 0) {
      divisors.push(i);
    }
  }

  for (const divisor of divisors) {
    const width = (PIXEL_SIZE * PIXEL_GRID_WIDTH) / divisor;
    const height = PIXEL_SIZE * PIXEL_GRID_HEIGHT;
    if (await checkSize(width, height)) {
      return divisor;
    }
  }

  throw new Error("Canvas size too large to render");
}

async function renderPixels(pixels?: Pixel[]) {
  const chunks = await getChunks();
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

  return Promise.all(blobs);
}

function PixelsDownload() {
  const session = useSession();
  const user = session.data?.user;
  const hasPermission =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.manageDonations));

  const pixels = usePixels();

  const [loading, setLoading] = useState(false);
  const download = useCallback(
    async (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (loading) return;
      setLoading(true);

      const blobs = await renderPixels(pixels);
      blobs.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alveus-mural-part-${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      setLoading(false);
    },
    [loading, pixels],
  );

  if (!hasPermission) return null;

  return (
    <Link
      href="#"
      onClick={download}
      aria-disabled={loading}
      dark
      className="mt-4 inline-flex items-center gap-2 aria-disabled:cursor-progress aria-disabled:opacity-50"
    >
      {loading ? (
        <IconLoading className="size-4" />
      ) : (
        <IconDownload className="size-4" />
      )}
      Download full mural
    </Link>
  );
}

export default PixelsDownload;
