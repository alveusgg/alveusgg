import reactAttrConverter from "react-attr-converter";

export type HTMLAttributes = Record<string, string>;

export const htmlToReact = (obj: HTMLAttributes) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [reactAttrConverter(key), value])
  );
