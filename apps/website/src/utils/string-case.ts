export const camelToKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export const camelToTitle = (str: string) =>
  `${str.slice(0, 1).toUpperCase()}${str.replace(/([a-z])([A-Z])/g, "$1 $2").slice(1)}`;

export const kebabToCamel = (str: string) =>
  str.replace(/-([a-z])/g, (g) => (g[1] as string).toUpperCase());

export const sentenceToKebab = (str: string) =>
  str.replace(/\s+/g, "-").toLowerCase();

export const sentenceToTitle = (str: string) =>
  str.replace(/\b\w/g, (g) => g.toUpperCase());

export const camelToSentence = (str: string) => {
  const sentence = str.replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
  return `${sentence.slice(0, 1).toUpperCase()}${sentence.slice(1)}`;
};
