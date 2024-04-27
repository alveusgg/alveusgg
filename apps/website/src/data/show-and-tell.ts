export const MAX_IMAGES = 16;
export const MAX_VIDEOS = 6;

export const MAX_TEXT_HTML_LENGTH = 1_000; // We allow more total html length than characters (ignoring tags)

const dateWhenTextShortened = new Date(2024, 3, 26);

export const getMaxTextLengthForCreatedAt = (createdAt?: Date) =>
  createdAt && createdAt < dateWhenTextShortened ? 700 : 300;
