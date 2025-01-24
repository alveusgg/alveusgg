export const camelToKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export const kebabToCamel = (str: string) =>
  str.replace(/-([a-z])/g, (g) => (g[1] as string).toUpperCase());

export const sentenceToKebab = (str: string) =>
  str.replace(/\s+/g, "-").toLowerCase();

export const sentenceToTitle = (str: string) =>
  str.replace(/\b\w/g, (g) => g.toUpperCase());
