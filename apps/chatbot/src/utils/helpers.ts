export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export const typeSafeObjectKeys = <T extends object>(obj: T) =>
  Object.keys(obj) as Array<keyof T>;
