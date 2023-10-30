export type TicketConfig = {
  width: number;
  height: number;
  canvasOffsetTop?: number;
  canvasOffsetLeft?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundImage?: string;
  foregroundImage?: string;
  maskImage?: string;
};

export type StickerGroup = {
  name: string;
  description?: string;
  attribution?: string;
  attributionLink?: string;
};

export type StickerPackItem<GroupId extends string = string> = {
  name: string;
  groupId: GroupId;
  filePath: string;
  width: number;
  height: number;
};

export type StickerPack<GroupId extends string = string> = {
  groups: Record<GroupId, StickerGroup>;
  stickers: Record<string, StickerPackItem<GroupId>>;
};

export const defaultTicketWidth = 899;
export const defaultTicketHeight = 350;

export function getVirtualTicketImageUrl(
  eventId: string,
  userName: string,
  imageType: "og" | "ticket" = "ticket",
) {
  const imagePath = `virtual-tickets/${eventId}/${encodeURIComponent(
    userName,
  )}`;
  const prefix = imageType === "og" ? "/api/og/" : "/api/";
  return `${prefix}${imagePath}`;
}

export function mapStickerIdToPath(
  stickers: StickerPack["stickers"],
  imageId: string,
) {
  if (!(imageId in stickers)) return;

  const { filePath } = stickers[
    imageId as keyof typeof stickers
  ] as StickerPackItem;

  return `/assets/stickers/${filePath}`;
}
