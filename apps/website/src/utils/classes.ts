import type { CSSProperties } from "react";

import { camelToKebab } from "./string-case";

export function classes(
  ...classes: Array<string | boolean | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

export function objToCss(
  obj: Record<string, CSSProperties> | CSSProperties,
): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === "object") return `${key} { ${objToCss(value)} }`;
      return `${camelToKebab(key)}: ${value};`;
    })
    .join(" ");
}
