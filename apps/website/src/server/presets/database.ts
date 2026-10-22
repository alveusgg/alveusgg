import { type Prisma, prisma } from "@alveusgg/database";

export type Transaction = Prisma.TransactionClient;
export const dbCode = (error: unknown) =>
  error !== null && typeof error === "object" && "code" in error
    ? error.code
    : undefined;
export async function presetTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: "Serializable",
        timeout: 15_000,
      });
    } catch (error) {
      // MySQL deadlocks from SELECT ... FOR UPDATE surface as raw-query errors.
      const rawDeadlock =
        dbCode(error) === "P2010" &&
        error !== null &&
        typeof error === "object" &&
        "meta" in error &&
        error.meta !== null &&
        typeof error.meta === "object" &&
        "code" in error.meta &&
        error.meta.code === "1213";
      if ((dbCode(error) !== "P2034" && !rawDeadlock) || attempt >= 2)
        throw error;
    }
  }
}
