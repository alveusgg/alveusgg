import type { CSSProperties } from "react";
import { type ClassNameValue, extendTailwindMerge } from "tailwind-merge";

import { camelToKebab } from "./string-case";

const twMerge = extendTailwindMerge<"text-stroke" | "animation-delay">({
  extend: {
    classGroups: {
      // src/styles/text-stroke.ts: `text-stroke`, `text-stroke-{1..4}`, `text-stroke-{color}`
      "text-stroke": [{ "text-stroke": ["", (v: string) => /^\d+$/.test(v)] }],
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
