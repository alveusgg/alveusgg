import type { CSSProperties } from "react";
import {
  type ClassNameValue,
  extendTailwindMerge,
  fromTheme,
} from "tailwind-merge";

import { camelToKebab } from "./string-case";

const twMerge = extendTailwindMerge<
  "text-stroke" | "text-stroke-color" | "animation-delay"
>({
  extend: {
    classGroups: {
      // src/styles/text-stroke.ts: `text-stroke`, `text-stroke-{1..4}`
      "text-stroke": [{ "text-stroke": ["", (v: string) => /^\d+$/.test(v)] }],
      // src/styles/text-stroke.ts: `text-stroke-{color}`
      "text-stroke-color": [{ "text-stroke": [fromTheme("color")] }],
      // src/styles/tailwind.css: @utility animation-delay-*
      "animation-delay": [
        { "animation-delay": [(v: string) => /^\d+$/.test(v)] },
      ],
    },
  },
});

export function classes(...inputs: ClassNameValue[]) {
  return twMerge(...inputs);
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
