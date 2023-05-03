import type { RefObject } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PT_Sans } from "next/font/google";
import { split } from "canvas-hypertxt";
import debounce from "just-debounce-it";

interface PushImageCanvasProps {
  heading: string;
  text: string;
  backgroundImageUrl: string;
  logoImageUrl: string;
  width?: number;
  height?: number;
}

const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: ["400", "700"],
});

function drawBackgroundCover(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const canvasAspectRatio = canvas.width / canvas.height;
  const imgAspectRatio = image.width / image.height;

  let destWidth: number;
  let destHeight: number;
  let offsetX = 0;
  let offsetY = 0;
  if (canvasAspectRatio > imgAspectRatio) {
    destWidth = canvas.width;
    destHeight = canvas.width / imgAspectRatio;
    offsetY = (canvas.height - destHeight) / 2;
  } else {
    destWidth = canvas.height * imgAspectRatio;
    destHeight = canvas.height;
    offsetX = (canvas.width - destWidth) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, destWidth, destHeight);
}

function drawTextBoxWithBlurredBg(
  ctx: CanvasRenderingContext2D,
  text: string,
  canvas: HTMLCanvasElement,
  bg: HTMLImageElement,
  {
    width: maxWidth = 900,
    x = 20,
    startY = 20,
    fontSize = 30,
    leading = 1.2,
    boxPaddingX = 20,
    boxPaddingY = 10,
    color = "black",
    boxBgColor = "rgba(255, 255, 255, 0.6)",
  } = {}
) {
  // Set up font
  const fontFamily = ptSans.style.fontFamily.replaceAll(" ", "").trim();
  const fontStyle = `normal ${fontSize}px ${fontFamily},sans-serif`;
  ctx.font = fontStyle;
  ctx.textBaseline = "bottom";

  // Calculate text lines
  const textMaxWidth = maxWidth - 2 * boxPaddingX;
  console.log("split lines with canvas-hypertxt", {
    textWidth: textMaxWidth,
    fontFamily,
  });
  const lines = [...split(ctx, text, fontStyle, textMaxWidth, true)].reverse();

  // Calculate text box
  let textWidth = 0;
  for (const line of lines) {
    textWidth = Math.max(textWidth, ctx.measureText(line).width);
  }
  const lineHeight = fontSize * leading;
  const textHeight = lines.length * lineHeight;
  const width = textWidth + 2 * boxPaddingX;
  const height = textHeight + 2 * boxPaddingY;
  let y = startY;

  // Blurred background box behind text
  ctx.save();
  const region = new Path2D();
  region.rect(x, y - height, width, height);
  ctx.clip(region);
  ctx.filter = "blur(5px)";
  drawBackgroundCover(canvas, bg);
  ctx.restore();

  // Box background behind text
  ctx.fillStyle = boxBgColor;
  ctx.fillRect(x, y - height, width, height);

  // Text
  ctx.fillStyle = color;
  for (const line of lines) {
    ctx.fillText(line, x + boxPaddingX, y - boxPaddingY, textWidth);
    y -= lineHeight;
  }

  return {
    height,
  };
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

type DrawPushImageProps = {
  canvasRef: RefObject<HTMLCanvasElement>;
  bgPromise: Promise<HTMLImageElement> | null;
  logoPromise: Promise<HTMLImageElement> | null;
  text: string;
  heading: string;
};

async function drawPushImage({
  canvasRef,
  bgPromise,
  logoPromise,
  text,
  heading,
}: DrawPushImageProps) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const [bg, logo] = await Promise.all([bgPromise, logoPromise]);
  if (!bg || !logo) return;

  // BG
  drawBackgroundCover(canvas, bg);

  // Text boxes
  let textHeight = 0;
  if (text.trim()) {
    textHeight = drawTextBoxWithBlurredBg(ctx, text, canvas, bg, {
      startY: canvas.height - 20,
      width: canvas.width - 40,
    }).height;
  }

  if (heading.trim()) {
    drawTextBoxWithBlurredBg(ctx, heading, canvas, bg, {
      startY: canvas.height - 20 - textHeight - 10,
      fontSize: 50,
      // alveus green bg
      boxBgColor: "rgba(44,47,43,0.7)",
      color: "white",
    });
  }

  // Logo
  ctx.drawImage(logo, canvas.width - 200, 20, 186, 205);
  canvasRef.current.classList.remove("opacity-50");
}

export function PushImageCanvas({
  heading,
  text,
  backgroundImageUrl,
  logoImageUrl,
  width = 1200,
  height = 630,
}: PushImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bgPromise, setBgPromise] = useState<Promise<HTMLImageElement> | null>(
    null
  );
  const [logoPromise, setLogoPromise] =
    useState<Promise<HTMLImageElement> | null>(null);

  useEffect(
    () => setBgPromise(loadImage(backgroundImageUrl)),
    [backgroundImageUrl]
  );
  useEffect(() => setLogoPromise(loadImage(logoImageUrl)), [logoImageUrl]);

  const debouncedAsyncEffect = useMemo(() => debounce(drawPushImage, 500), []);
  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.classList.add("opacity-50");
    debouncedAsyncEffect({ canvasRef, bgPromise, logoPromise, text, heading });
  }, [bgPromise, debouncedAsyncEffect, heading, logoPromise, text]);

  return (
    <canvas
      className="h-auto w-full opacity-100 transition-opacity"
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
}
