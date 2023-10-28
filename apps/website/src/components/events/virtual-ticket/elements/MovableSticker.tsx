import { useTicketEditorContext } from "@/components/events/virtual-ticket/TicketEditor";
import { Movable, useMovableData } from "./Movable";

export function MovableSticker({
  imageId,
  image,
  x: initialX,
  y: initialY,
  onPositionChange,
}: {
  imageId: string;
  onPositionChange?: (x: number, y: number) => void;
  image: string;
  x: number;
  y: number;
}) {
  const { setSelectedSticker, selectedSticker } = useTicketEditorContext();
  const { x, y } = useMovableData({ initialX, initialY, onPositionChange });

  return (
    <Movable
      as="img"
      width={64}
      height={64}
      src={image}
      x={x}
      y={y}
      className={`rounded-lg opacity-95 ${
        selectedSticker === imageId
          ? "bg-blue-700/20 ring-2 ring-blue"
          : "hover:bg-blue-700/30"
      }`}
      onPointerDown={() => {
        setSelectedSticker(imageId);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    />
  );
}
