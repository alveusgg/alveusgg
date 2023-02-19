export const camelToKebab = (str: string) => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, g => (g[1] as string).toUpperCase());
