export const MAX_IMAGES = 16;
export const MAX_VIDEOS = 6;

export const MAX_TEXT_HTML_LENGTH = 1_000; // We allow more total html length than characters (ignoring tags)
export const MYSQL_MAX_VARCHAR_LENGTH = 191; // https://www.prisma.io/docs/orm/overview/databases/mysql#native-type-mapping-from-prisma-orm-to-mysql

const dateWhenTextShortened = new Date(2024, 3, 27, 15, 19, 0, 0);

export const getMaxTextLengthForCreatedAt = (createdAt?: Date) =>
  createdAt && createdAt < dateWhenTextShortened ? 700 : 300;

export const resizeImageOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 90,
};
