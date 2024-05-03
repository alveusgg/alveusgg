export function transposeMatrix<T = unknown>(matrix: T[][]) {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length;

  const transposed: T[][] = Array.from({ length: numCols }).map(() =>
    Array(numRows).fill(0),
  );

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      transposed[j]![i] = matrix[i]?.[j]!;
    }
  }

  return transposed;
}
