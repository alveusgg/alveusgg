export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export const typeSafeObjectKeys = <T extends object>(obj: T) =>
  Object.keys(obj) as Array<keyof T>;

export const typeSafeObjectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

export const typeSafeObjectFromEntries = <T extends [string, unknown][]>(
  entries: T,
) => Object.fromEntries(entries) as { [K in T[number][0]]: T[number][1] };

export const safeJSONParse = (val: string): unknown => {
  try {
    return JSON.parse(val);
  } catch {
    return undefined;
  }
};
