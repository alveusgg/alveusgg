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
      if (dbCode(error) !== "P2034" || attempt >= 2) throw error;
    }
  }
}
