export function countUnique(array: unknown[]) {
  return new Set(array).size;
}

export function shuffle<T>(array: readonly T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
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

/**
 * Parse a Next.js URL query parameter into an array.
 * Handles the query parameter being present more than once (e.g. ?users=1&users=2)
 * Also, handles the query parameter being a comma-separated list (e.g. ?users=1,2)
 */
export function queryArray(param: string | string[] | undefined) {
  if (!param) return [];

  return (Array.isArray(param) ? param : [param])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}
