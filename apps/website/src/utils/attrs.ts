import reactAttrConverter from "react-attr-converter";

export type HTMLAttributes = Record<string, string>;

const convertAttributeKey = (key: string) => {
  if (key === "referrerpolicy") {
    return "referrerPolicy";
  }

  return reactAttrConverter(key);
};

export const htmlToReact = (obj: HTMLAttributes) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      convertAttributeKey(key),
      value,
    ]),
  );
