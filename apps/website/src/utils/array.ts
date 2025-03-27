export function countUnique(array: unknown[]) {
  return new Set(array).size;
}

export function mapFirst<T, U>(
  array: T[],
  fn: (item: T) => U | undefined,
): U | undefined {
  for (const item of array) {
    const result = fn(item);
    if (result !== undefined) {
      return result;
    }
  }
}
