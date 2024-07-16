export type StickerProps = {
  image: string;
  x: number;
  y: number;
};

export function Sticker({ image, x, y }: StickerProps) {
  return (
    <img
      style={{
        pointerEvents: "none",
        userSelect: "none",
        cursor: "default",
        position: "absolute",
        top: y,
        left: x,
        opacity: 0.95,
        width: 64,
        height: 64,
      }}
      src={image}
      alt=""
    />
  );
}
